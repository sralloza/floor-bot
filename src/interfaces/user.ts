export interface IUser {
  id: number
  email: string
  name: string
}

export interface UserPublic {
  email: string
  name: string
}

export interface UserRegisterInput {
  email: string
  name: string
}

export interface UserLoginInput {
  googleToken: string
}
