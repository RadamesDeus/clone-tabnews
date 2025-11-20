import { createRouter } from "next-connect";

import { onNoMatch, onError } from "infra/controller";

const router = createRouter();

router.get(status);

export default router.handler({
  onNoMatch,
  onError,
});

async function status(request, response) {
  response.status(200).json({
    dealerSchedules: [
      {
        dealerCode: "1013017",
        dmsCode: "DNT",
        consultantCode: "663",
        dateTimeSchedule: "2025-12-06 08:00:00",
        dateTimeEndSchedule: "2025-12-06 08:30:00",
        roaServiceCode: "000001-MC441-20-22",
        origin: "dac",
        dealerRedirect: "true",
        customerVoice: "TESTE HONDA - CANCELAR",
        scheduleProtocol: "SCH2025111249291058",
        statusSchedule: "novo",
        customer: {
          customerType: "PF",
          customerDocument: "05769435763",
          customerName: "Maria Julia Damasceno Miranda Nolasco",
          customerEmail: "mariajdmn@gmail.com",
          customerCellPhone: "27988784920",
          customerPhone: "0000000000",
          customerModel: {
            familyType: "2W",
            familyCode: "13",
            familyName: "XRE 300 SAHARA",
            modelCode: "65",
            modelName: "XRE 300 SAHARA",
            modelYear: 2026,
            modelKm: 1345,
            modelPlate: "ABC1234",
          },
        },
        scheduleServices: [
          {
            serviceCode: "000001-MC441-20-22",
            serviceType: "Revisão",
            serviceDescription: "REVISÃO 1000 km",
            serviceMoPrice: 0.0,
            servicePartsPrice: 324.98,
            serviceFixedPrice: 0.0,
            serviceParts: [],
          },
        ],
      },
    ],
    totalResults: 1,
    page: 1,
    totalPages: 1,
  });
}
