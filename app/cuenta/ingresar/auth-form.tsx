"use client"

import { useActionState, useEffect, useState } from "react"
import { LogIn, UserPlus } from "lucide-react"
import { Notice, fieldClass, primaryButtonClass } from "@/components/account-shell"
import { signIn, signUp, type AuthState } from "./actions"

type Mode = "ingresar" | "registro"

export function AuthForm({ next, initialMode }: { next: string; initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, {})
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {})
  const state = mode === "ingresar" ? signInState : signUpState
  const goTo = signInState.goTo ?? signUpState.goTo
  const pending = signingIn || signingUp || Boolean(goTo)

  // Navegación completa: /api/descargar responde con redirecciones (comprar o instalador) que el
  // enrutador del cliente no sigue.
  useEffect(() => {
    if (goTo) window.location.assign(goTo)
  }, [goTo])

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      id={`tab-${value}`}
      aria-selected={mode === value}
      aria-controls="panel-cuenta"
      onClick={() => setMode(value)}
      className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-ring ${
        mode === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="max-w-md">
      <div role="tablist" aria-label="Tipo de acceso" className="flex gap-1 rounded-xl bg-secondary p-1">
        {tab("ingresar", "Iniciar sesión")}
        {tab("registro", "Crear cuenta")}
      </div>

      <form
        key={mode}
        id="panel-cuenta"
        role="tabpanel"
        aria-labelledby={`tab-${mode}`}
        action={mode === "ingresar" ? signInAction : signUpAction}
        className="mt-6 flex flex-col gap-5"
        noValidate
      >
        <input type="hidden" name="next" value={next} />
        <label className="text-sm font-semibold">
          Correo electrónico
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.email}
            className={fieldClass}
          />
        </label>
        <label className="text-sm font-semibold">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete={mode === "ingresar" ? "current-password" : "new-password"}
            required
            minLength={mode === "registro" ? 8 : undefined}
            aria-describedby={mode === "registro" ? "ayuda-clave" : undefined}
            className={fieldClass}
          />
          {mode === "registro" && (
            <span id="ayuda-clave" className="mt-1.5 block text-xs font-normal text-muted-foreground">
              Al menos 8 caracteres, con letras y números.
            </span>
          )}
        </label>
        {mode === "registro" && (
          <label className="text-sm font-semibold">
            Repite la contraseña
            <input name="confirm" type="password" autoComplete="new-password" required className={fieldClass} />
          </label>
        )}

        {state.error && <Notice tone="error">{state.error}</Notice>}
        {state.info && <Notice tone="ok">{state.info}</Notice>}

        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {mode === "ingresar" ? <LogIn className="size-5" aria-hidden="true" /> : <UserPlus className="size-5" aria-hidden="true" />}
          {pending ? "Un momento…" : mode === "ingresar" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
        <p className="text-sm text-muted-foreground">
          Usarás este mismo correo y contraseña para entrar en la app de escritorio.
        </p>
      </form>
    </div>
  )
}
