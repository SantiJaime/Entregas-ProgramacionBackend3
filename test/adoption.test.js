import "dotenv/config";
import request from "supertest";
import { usersService, petsService } from "../src/services/index.js";
import { generatePet, generateUser } from "../src/utils/faker.js";
import app from "../src/server/app.js";
import mongoose from "mongoose";

describe("Adoptions Router", function () {
  let userId;
  let petId;
  let adoptionId;

  before(function () {
    mongoose.connect(process.env.MONGO_CONNECT);
    console.log("Conectado a la base de datos");
  });

  before(async function () {
    const fakeUser = await generateUser(1);
    const user = await usersService.create(fakeUser);
    userId = user[0]._id;

    const fakePet = await generatePet(1);
    const pet = await petsService.create(fakePet);
    petId = pet[0]._id;
  });

  it("POST /api/adoptions/:uid/:pid - Debería crear una adopción", function (done) {
    request(app)
      .post(`/api/adoptions/${userId}/${petId}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.body.status !== "success") {
          return done(
            new Error("Adopción fallida, se esperaba status success")
          );
        }
        done();
      });
  });

  it("GET /api/adoptions/ - Debería retornar una lista de adopciones", function (done) {
    request(app)
      .get("/api/adoptions/")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err) return done(err);
        if (!Array.isArray(res.body.payload)) {
          return done(new Error("Se esperaba un array de adopciones"));
        }
        adoptionId = res.body.payload[0]?._id;
        done();
      });
  });

  it("GET /api/adoptions/:aid - Debería retornar una adopción específica", function (done) {
    request(app)
      .get(`/api/adoptions/${adoptionId}`)
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.body.status !== "success") {
          return done(new Error("No se encontró la adopción esperada"));
        }
        done();
      });
  });
});
