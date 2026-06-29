function getOrigin() {
  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") {
    return `https://${process.env.HOST}`;
  }
  return `http://localhost:${process.env.PORT}`;
}
const wecserver = {
  getOrigin,
};

export default wecserver;
