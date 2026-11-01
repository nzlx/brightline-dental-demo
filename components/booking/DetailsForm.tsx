"use client";

import { useState } from "react";
import { booking, insurers } from "@/content";
import { formatDob, formatPhone, validate, type Details } from "./types";

type Field = keyof Details;
const required: Field[] = ["name", "dob", "phone", "email", "insurance"];

type Props = { initial: Details; kids: boolean; emergency: boolean; onSubmit: (d: Details) => void };

export default function DetailsForm({ initial, kids, emergency, onSubmit }: Props) {
  const [v, setV] = useState<Details>(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const errors = validate(v);

  const set = (f: Field, value: string) =>
    setV((p) => ({ ...p, [f]: f === "phone" ? formatPhone(value) : f === "dob" ? formatDob(value) : value }));
  const touch = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));
  const show = (f: Field) => (touched[f] ? errors[f] : undefined);
  const hasCarrier = !!v.insurance && v.insurance !== booking.insuranceSelfPay;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(required.map((f) => [f, true])));
      const first = required.find((f) => errors[f]);
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    onSubmit({
      ...v,
      name: v.name.trim(),
      email: v.email.trim(),
      memberId: hasCarrier ? v.memberId.trim() : "",
      notes: v.notes.trim(),
    });
  };

  return (
    <form id="booking-details" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Input
        label={kids ? "Child's full name" : "Patient's full name"}
        name="name"
        autoComplete={kids ? "off" : "name"}
        value={v.name}
        error={show("name")}
        onChange={(x) => set("name", x)}
        onBlur={touch("name")}
        placeholder={kids ? "Lily Martinez" : "Jordan Martinez"}
      />
      <Input
        label="Date of birth"
        name="dob"
        inputMode="numeric"
        autoComplete={kids ? "off" : "bday"}
        value={v.dob}
        error={show("dob")}
        onChange={(x) => set("dob", x)}
        onBlur={touch("dob")}
        placeholder="MM/DD/YYYY"
      />
      <Input
        label={kids ? "Parent's mobile phone" : "Mobile phone"}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={v.phone}
        error={show("phone")}
        onChange={(x) => set("phone", x)}
        onBlur={touch("phone")}
        placeholder="(512) 555-0100"
      />
      <Input
        label={kids ? "Parent's email" : "Email"}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={v.email}
        error={show("email")}
        onChange={(x) => set("email", x)}
        onBlur={touch("email")}
        placeholder="jordan@example.com"
      />

      <div className={hasCarrier ? "" : "sm:col-span-2"}>
        <label htmlFor="bk-insurance" className="mb-1.5 block text-sm font-semibold text-ink">
          Dental insurance
        </label>
        <div className="relative">
          <select
            id="bk-insurance"
            name="insurance"
            value={v.insurance}
            required
            aria-invalid={!!show("insurance")}
            aria-describedby={show("insurance") ? "bk-insurance-err" : undefined}
            onChange={(e) => {
              set("insurance", e.target.value);
              touch("insurance")();
            }}
            onBlur={touch("insurance")}
            className={`field appearance-none pr-10 ${v.insurance ? "" : "text-muted"}`}
          >
            <option value="" disabled>
              Choose your plan…
            </option>
            <optgroup label="In network">
              {insurers.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </optgroup>
            <optgroup label="Other">
              <option>{booking.insuranceOther}</option>
              <option>{booking.insuranceSelfPay}</option>
            </optgroup>
          </select>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {show("insurance") && (
          <p id="bk-insurance-err" className="mt-1.5 text-sm text-danger">
            {errors.insurance}
          </p>
        )}
      </div>
      {hasCarrier && (
        <Input
          label="Member ID"
          optional
          name="memberId"
          autoComplete="off"
          value={v.memberId}
          onChange={(x) => set("memberId", x)}
          onBlur={() => {}}
          placeholder="From your insurance card"
        />
      )}

      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-ink">
          {emergency ? "What's going on?" : "Anything we should know?"} <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          maxLength={400}
          value={v.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder={
            emergency
              ? "Which tooth hurts, since when, any swelling or fever…"
              : "Dental anxiety, sensitive spots, questions for the doctor…"
          }
          className="field h-auto resize-none py-3"
        />
      </label>
      <p className="text-xs text-muted sm:col-span-2">
        We only use these details to confirm your visit and check your benefits. Your information is private.
      </p>
    </form>
  );
}

type InputProps = {
  label: string;
  name: Field;
  value: string;
  error?: string;
  optional?: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  className?: string;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "autoComplete" | "placeholder">;

function Input({ label, name, value, error, optional, onChange, onBlur, className = "", ...rest }: InputProps) {
  const id = `bk-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        required={!optional}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="field"
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
