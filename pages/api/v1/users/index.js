import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.post(postHandlerUsers);

export default router.handler({
  onNoMatch,
  onError,
});

async function postHandlerUsers(request, response) {
  console.log("request.body:", request.body);

  const userData = request.body; //JSON.parse(request.body);
  //console.log("request userData:", userData);
  const newUser = await user.create(userData);
  return response.status(201).json(newUser);
}
