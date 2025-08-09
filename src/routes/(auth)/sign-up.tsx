import { createFileRoute } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { SignUpSchema } from '@/lib/schema'
import { TextField } from '@/components/ui/text-field'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { signUpSchema } from '@/lib/schema'
import { authClient } from '@/lib/auth-client'
import { Loader } from '@/components/ui/loader'
import { Note } from '@/components/ui/note'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (formInputData: SignUpSchema) => {
    await authClient.signUp.email(formInputData, {
      onSuccess: ({ data }) => {
        const name = data?.user?.name as string
        toast.success(`Signed up successfully! Welcome, ${name}`)
        navigate({ to: '/' })
      },
      onError: ({ error: responseError }) => {
        setError('root', { message: responseError.message })
      },
    })
  }

  return (
    <div className="w-full">
      <Link to="/">
        <Logo className="size-7" />
      </Link>
      <h1 className="mt-2 font-semibold  text-xl/10">Sign up</h1>
      <p className="text-muted-fg text-sm/6">
        Create an account to get exclusive offers, save your favorites, and
        speed through checkout.
      </p>
      {errors.root?.message ? (
        <Note intent="danger" className="mt-5">
          {errors.root.message}
        </Note>
      ) : null}
      <form
        className={cn(
          'mt-6 grid w-full grid-cols-1 gap-6',
          errors.root?.message && 'mt-5',
        )}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              className="w-full"
              label="Name"
              {...field}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              className="w-full"
              label="Email"
              type="email"
              {...field}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              className="w-full"
              label="Password"
              {...field}
              type="password"
              isRevealable
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Button type="submit" isPending={isSubmitting}>
          {isSubmitting && <Loader />}
          Sign up
        </Button>
      </form>
      <hr className="mt-8 mb-6 w-full border-border/50" />
      <p className="text-muted-fg text-sm/6">
        Already have an account?{' '}
        <Link
          to="/sign-in"
          className="font-medium cursor-pointer text-primary-subtle-fg hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
