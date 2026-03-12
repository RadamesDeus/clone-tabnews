import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = process.env.NODE_ENV === "production" ? 10 : 1;
  return await bcryptjs.hash(password, rounds);
}
async function verify(password, hashedPassword) {
  return await bcryptjs.compare(password, hashedPassword);
}

const password = {
  hash,
  verify,
};

export default password;
