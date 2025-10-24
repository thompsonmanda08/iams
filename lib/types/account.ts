export type LoginPayload = {
  emailusername: string;
  password: string;
};

export type User = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  [x: string]: string;
};

export type AccountOwner = User & {
  role: 'owner';
  password: string;
  changePassword: string;
};
