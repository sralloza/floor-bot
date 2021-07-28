import "reflect-metadata";
import Container from "typedi";
import GSExchangeRateService, {
  Concept,
  DBInput,
  ExchangeRate
} from "../../services/gsExchangeRate";

describe("GSExchangeRateService", () => {
  const sheetRates: DBInput[] = [
    { concepto: "cocina", tickets: "4" },
    { concepto: "baños", tickets: "5" },
    { concepto: "salón", tickets: "4" },
    { concepto: "basura", tickets: "1" },
    { concepto: "lavavajillas", tickets: "1" }
  ];
  const expectedRates: ExchangeRate[] = [
    { concept: "cocina", tickets: 4 },
    { concept: "baños", tickets: 5 },
    { concept: "salón", tickets: 4 },
    { concept: "basura", tickets: 1 },
    { concept: "lavavajillas", tickets: 1 }
  ];
  let service: GSExchangeRateService;
  const validConcepts: Concept[] = [
    "cocina",
    "baños",
    "salón",
    "basura",
    "lavavajillas"
  ];
  const invalidConcepts = ["floor", "car", "api", 1, false] as unknown as Concept[];

  beforeAll(() => {
    const logMock = jest.fn();
    const docMock = jest.fn().mockImplementation(() => {
      return { sheetsById: { "1120508069": { getRows: () => sheetRates } } };
    });
    Container.set("logger", logMock());
    Container.set("doc", docMock());
    service = Container.get(GSExchangeRateService);
  });

  it("should get rates", async () => {
    const realRates = await service.getRates();
    expect(realRates).toStrictEqual(expectedRates);
  });

  it("should get rates by valid concepts", async () => {
    for (const concept of validConcepts) {
      await expect(service.getRateByConcept(concept)).resolves.toStrictEqual(
        expectedRates.filter((e) => e.concept === concept)[0]
      );
    }
  });

  it("should raise error when getting rates by invalid concepts", async () => {
    for (const concept of invalidConcepts) {
      await expect(service.getRateByConcept(concept)).rejects.toThrow(
        "Invalid concept"
      );
    }
  });

  it("should get rates by task type", async () => {
    await expect(service.getRateByTaskType("Bathroom")).resolves.toStrictEqual(
      expectedRates.filter((e) => e.concept === "baños")[0]
    );
    await expect(service.getRateByTaskType("Kitchen")).resolves.toStrictEqual(
      expectedRates.filter((e) => e.concept === "cocina")[0]
    );
    await expect(service.getRateByTaskType("LivingRoom")).resolves.toStrictEqual(
      expectedRates.filter((e) => e.concept === "salón")[0]
    );
  });
});
