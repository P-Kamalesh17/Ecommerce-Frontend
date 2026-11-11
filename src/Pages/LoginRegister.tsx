import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { tokenStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type LoginData = {
  email: string
  password: string
}

type RegisterData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  address: string
}

const initialLoginData: LoginData = {
  email: "",
  password: "",
}

const initialRegisterData: RegisterData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
}

export function LoginRegister() {
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [loginData, setLoginData] =
    React.useState<LoginData>(initialLoginData)

  const [registerData, setRegisterData] =
    React.useState<RegisterData>(initialRegisterData)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target

    if (isLogin) {
      setLoginData((previous) => ({
        ...previous,
        [id]: value,
      }))
    } else {
      setRegisterData((previous) => ({
        ...previous,
        [id]: value,
      }))
    }
  }

  const handleSubmit = async () => {
    setError(null)

    /* ---------- Form validation ---------- */

    if (isLogin) {
      if (!loginData.email.trim() || !loginData.password.trim()) {
        setError("Email and password are required.")
        return
      }
    } else {
      if (
        !registerData.fullName.trim() ||
        !registerData.email.trim() ||
        !registerData.password.trim() ||
        !registerData.confirmPassword.trim() ||
        !registerData.address.trim()
      ) {
        setError("Please fill in all fields.")
        return
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError("Passwords do not match.")
        return
      }
    }

    const url = isLogin
      ? `${API_BASE_URL}/api/Authentication/login`
      : `${API_BASE_URL}/api/Authentication/register`

    const requestBody = isLogin
      ? {
          email: loginData.email.trim(),
          password: loginData.password,
        }
      : {
          fullName: registerData.fullName.trim(),
          email: registerData.email.trim(),
          password: registerData.password,
          phoneNumber: registerData.phoneNumber.trim() || null,
          address: registerData.address.trim(),
        }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const rawBody = await response.text()

      let data: any = {}
      if (rawBody) {
        try {
          data = JSON.parse(rawBody)
        } catch {
          data = { message: rawBody }
        }
      }
      console.log(data);
      if (!response.ok) {
        setError(
          (typeof data === "string" ? data : data.message || data.error) ||
            "Request failed."
        )
        return
      }

      /* ---------- Login success ---------- */

      if (isLogin) {
        if (!data.token || !data.refreshToken) {
          setError("Login succeeded, but no token was returned by the API.")
          return
        }

        // access token -> memory, refresh token -> localStorage
        tokenStore.setTokens(data)

        navigate("/")
        return
      }

      /* ---------- Registration success ---------- */

      console.log("Registration successful:", data)

      setRegisterData(initialRegisterData)
      setIsLogin(true)
      setError(null)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      )
    }
  }

  const changeMode = () => {
    setError(null)

    setLoginData(initialLoginData)
    setRegisterData(initialRegisterData)

    setShowPassword(false)
    setShowConfirmPassword(false)

    setIsLogin((previous) => !previous)
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center px-4",
        isLogin ? "mt-[8%]" : "mt-[1%]"
      )}
    >
      <div className="mx-auto grid w-full max-w-sm gap-4">
        <Card
          className={
            isLogin
              ? "[--card-spacing:--spacing(8)]"
              : "[--card-spacing:--spacing(4)]"
          }
        >
          <CardHeader>
            <CardTitle>
              {isLogin ? "Login to your account" : "Create your account"}
            </CardTitle>

            <CardDescription>
              {isLogin
                ? "Enter your email below to login to your account."
                : "Enter your details below to create an account."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-6">
              {/* Full Name: registration only */}
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>

                  <Input
                    id="fullName"
                    type="text"
                    value={registerData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={isLogin ? loginData.email : registerData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={
                      isLogin ? loginData.password : registerData.password
                    }
                    onChange={handleChange}
                    className="pr-10"
                    required
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Registration-only fields */}
              {!isLogin && (
                <>
                  {/* Confirm Password */}
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={handleChange}
                        className="pr-10"
                        required
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4 text-muted-foreground" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Phone Number (optional) */}
                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>

                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={20}
                      value={registerData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Address */}
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>

                    <Textarea
                      id="address"
                      value={registerData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="button" className="w-full" onClick={handleSubmit}>
              {isLogin ? "Login" : "Sign Up"}
            </Button>

            <CardAction>
              <Button type="button" variant="link" onClick={changeMode}>
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </Button>
            </CardAction>
          </CardFooter>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>
              {isLogin ? "Login failed" : "Registration failed"}
            </AlertTitle>

            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}