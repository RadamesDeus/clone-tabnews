import { createRouter } from "next-connect";
import controller, { onNoMatch, onError } from "infra/controller";
import activation from "models/activation.js";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandlerToken);

export default router.handler({
  onNoMatch,
  onError,
});

async function patchHandlerToken(request, response) {
  const token = request.query?.token;

  const activationTokenMatch = await activation.findActivationByToken(token);
  await activation.activateUserbyUserId(activationTokenMatch.user_id);
  const activationTokenUsed = await activation.markTokenAsUsed(token);

  return response.status(200).json(activationTokenUsed);
}
