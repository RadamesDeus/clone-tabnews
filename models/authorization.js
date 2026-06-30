async function can(userFeatures, requestFeature) {
  let authorized = false;
  if (userFeatures.includes(requestFeature)) authorized = true;
  return authorized;
}

const authorization = {
  can,
};

export default authorization;
