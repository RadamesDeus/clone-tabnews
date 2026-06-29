import { createRouter } from "next-connect";
import { onNoMatch, onError } from "infra/controller";
import activation from "models/activation.js";

const router = createRouter();

router.patch(patchHandlerToken);

export default router.handler({
  onNoMatch,
  onError,
});

async function patchHandlerToken(request, response) {
  const token = request.query?.token;

  const activationTokenMatch = await activation.findActivationByToken(token);
  const activationTokenUsed = await activation.markTokenAsUsed(token);
  await activation.createSessionUser(activationTokenMatch.user_id);

  return response.status(200).json(activationTokenUsed);
}
