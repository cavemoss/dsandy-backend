import * as bcrypt from 'bcrypt';

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};
