import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import user from "models/user.js";
import activation from "models/activation.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandlerUsers);

export default router.handler({
  onNoMatch,
  onError,
});

async function postHandlerUsers(request, response) {
  const userData = request.body; //JSON.parse(request.body);

  const newUser = await user.create(userData);

  const token = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, token.id);

  return response.status(201).json(newUser);
}
