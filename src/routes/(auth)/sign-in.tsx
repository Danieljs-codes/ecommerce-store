import { createFileRoute } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { SignInSchema } from '@/lib/schema'
import { TextField } from '@/components/ui/text-field'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { signInSchema } from '@/lib/schema'
import { authClient } from '@/lib/auth-client'
import { Loader } from '@/components/ui/loader'
import { Note } from '@/components/ui/note'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export const Route = createFileRoute('/(auth)/sign-in')({
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
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (formInputData: SignInSchema) => {
    await authClient.signIn.email(formInputData, {
      onSuccess: ({ data }) => {
        const name = data?.user?.name as string | undefined
        toast.success(
          name
            ? `Signed in successfully! Welcome back, ${name}`
            : 'Signed in successfully!',
        )
        navigate({ to: '/' })
      },
      onError: ({ error: responseError }) => {
        setError('root', { message: responseError.message })
      },
    })
  }

  return (
    <div className="w-full">
      <Logo className="size-7" />
      <h1 className="mt-2 font-semibold  text-xl/10">Sign in</h1>
      <p className="text-muted-fg text-sm/6">
        Welcome back! Sign in to continue shopping, track orders, and manage
        your account.
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
        <div className="flex items-center justify-between">
          <Controller
            control={control}
            name="rememberMe"
            render={({ field: { value, ...field }, fieldState }) => (
              <Checkbox
                isSelected={value}
                isInvalid={fieldState.invalid}
                {...field}
              >
                Remember Me
              </Checkbox>
            )}
          />
          <Link
            to="/forgot-password"
            className="text-sm/6 font-medium text-primary-subtle-fg hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" isPending={isSubmitting}>
          {isSubmitting && <Loader />}
          Sign in
        </Button>
      </form>
      <hr className="mt-8 mb-6 w-full border-border/50" />
      <p className="text-muted-fg text-sm/6">
        Don't have an account?{' '}
        <Link
          to="/sign-up"
          className="font-medium cursor-pointer text-primary-subtle-fg hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
