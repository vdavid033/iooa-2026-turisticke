const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("./auth.config.js");
const authJwt = require("./authJwt.js");
const dbConfig = require("./dbConfig");
const createChatbotRouter = require("./chatbot");

const app = express();
const PORT = 4200;
const saltRounds = 10;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: "*" }));

const dbConn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

dbConn.connect((err) => {
  if (err) {
    console.error("Greška pri spajanju na bazu:", err);
    return;
  }

  console.log("Spojeno na bazu.");
});

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    dbConn.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

function sendSuccess(res, data = null, message = "OK", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

function sendError(
  res,
  message = "Došlo je do greške.",
  status = 500,
  error = null
) {
  return res.status(status).json({
    success: false,
    message,
    error,
  });
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/*
  CHATBOT ROUTER
*/
app.use("/api/chatbot", createChatbotRouter({ queryAsync }));

/*
  ATRAKCIJE
*/
app.put("/updateImage/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { slika } = req.body;

    if (!id) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    if (!slika) {
      return sendError(res, "Slika je potrebna.", 400);
    }

    const result = await queryAsync(
      "UPDATE atrakcije SET slika = ? WHERE id_atrakcije = ?",
      [slika, id]
    );

    return sendSuccess(res, result, "Slika uspješno ažurirana.");
  } catch (error) {
    console.error("Error updating image:", error);
    return sendError(
      res,
      "Došlo je do pogreške prilikom ažuriranja slike.",
      500,
      error.message
    );
  }
});

app.post(
  "/unosAtrakcija",
  authJwt.verifyToken("admin, korisnik"),
  async (req, res) => {
    try {
      const data = req.body;

      if (!isNonEmptyString(data.naziv) || !isNonEmptyString(data.opis)) {
        return sendError(res, "Naziv i opis su obavezni.", 400);
      }

      const values = [
        data.naziv,
        data.opis,
        data.slika || null,
        data.prosjecna_ocjena ?? 0,
        data.geografska_duzina ?? null,
        data.geografska_sirina ?? null,
        data.adresa || null,
        req.userId,
      ];

      const result = await queryAsync(
        `INSERT INTO atrakcije 
        (naziv, opis, slika, prosjecna_ocjena, geografska_duzina, geografska_sirina, adresa, id_korisnik)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );

      return sendSuccess(res, result, "Atrakcija uspješno unesena.", 201);
    } catch (error) {
      console.error("Error inserting attraction:", error);
      return sendError(
        res,
        "Došlo je do pogreške prilikom unosa atrakcije.",
        500,
        error.message
      );
    }
  }
);

app.post("/dodavanje_slike", async (req, res) => {
  try {
    const { id_atrakcije_s, slika_s } = req.body;

    if (!parseId(id_atrakcije_s) || !slika_s) {
      return sendError(res, "ID atrakcije i slika su obavezni.", 400);
    }

    const result = await queryAsync(
      "INSERT INTO slike (id_atrakcije_s, slika_s) VALUES (?, ?)",
      [id_atrakcije_s, slika_s]
    );

    return sendSuccess(res, result, "Slika dodana.", 201);
  } catch (error) {
    console.error("Greška pri dodavanju slike:", error);
    return sendError(res, "Greška pri dodavanju slike.", 500, error.message);
  }
});

app.post("/api/unos-slike", async (req, res) => {
  try {
    const { slika } = req.body;

    if (!slika) {
      return sendError(res, "Slika je obavezna.", 400);
    }

    const result = await queryAsync("INSERT INTO predmet (slika) VALUES (?)", [
      slika,
    ]);

    return sendSuccess(res, result, "Slika je dodana.", 201);
  } catch (error) {
    console.error("Greška kod /api/unos-slike:", error);
    return sendError(
      res,
      "Dogodila se greška prilikom dodavanja slike.",
      500,
      error.message
    );
  }
});

app.get("/atrakcije", async (req, res) => {
  try {
    const idKorisnika = parseId(req.query.id_korisnik);

    if (!idKorisnika) {
      return sendError(res, "ID korisnika je potreban.", 400);
    }

    const result = await queryAsync(
      "SELECT * FROM atrakcije WHERE id_korisnik = ?",
      [idKorisnika]
    );

    return sendSuccess(res, result, "Lista atrakcija korisnika.");
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju atrakcija.",
      500,
      error.message
    );
  }
});

app.get("/natrakcije/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    const result = await queryAsync(
      "SELECT * FROM atrakcije WHERE id_atrakcije = ?",
      [id]
    );

    if (!result.length) {
      return sendError(res, "Atrakcija nije pronađena.", 404);
    }

    return sendSuccess(res, result[0], "Atrakcija pronađena.");
  } catch (error) {
    console.error("Error fetching attraction:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju atrakcije.",
      500,
      error.message
    );
  }
});

app.get("/slike", async (req, res) => {
  try {
    const result = await queryAsync("SELECT * FROM slike");
    return sendSuccess(res, result, "Lista slika.");
  } catch (error) {
    console.error("Error fetching images:", error);
    return sendError(res, "Greška pri dohvaćanju slika.", 500, error.message);
  }
});

app.get("/sveatrakcije", async (req, res) => {
  try {
    const result = await queryAsync("SELECT * FROM atrakcije");
    return sendSuccess(res, result, "Lista svih atrakcija.");
  } catch (error) {
    console.error("Error fetching all attractions:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju svih atrakcija.",
      500,
      error.message
    );
  }
});

/*
  KOMENTARI
*/
app.get("/komentari", async (req, res) => {
  try {
    const results = await queryAsync("SELECT * FROM Komentari");
    return sendSuccess(res, results, "Lista komentara.");
  } catch (error) {
    console.error("Greška pri dohvaćanju komentara:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju komentara.",
      500,
      error.message
    );
  }
});

app.get("/komentari/:id", async (req, res) => {
  try {
    const id_atrakcije = parseId(req.params.id);

    if (!id_atrakcije) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    const results = await queryAsync(
      "SELECT * FROM Komentari WHERE VK_ID_atrakcije = ?",
      [id_atrakcije]
    );

    return sendSuccess(res, results, "Lista komentara.");
  } catch (error) {
    console.error("Greška pri dohvaćanju komentara po atrakciji:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju komentara.",
      500,
      error.message
    );
  }
});

app.post("/dodajKomentar/:id", async (req, res) => {
  try {
    const attractionId = parseId(req.params.id);
    const komentar = req.body.Komentar;

    if (!attractionId || !isNonEmptyString(komentar)) {
      return sendError(res, "Komentar i ID atrakcije su obavezni.", 400);
    }

    const result = await queryAsync(
      "INSERT INTO Komentari (Komentar, VK_ID_atrakcije) VALUES (?, ?)",
      [komentar.trim(), attractionId]
    );

    return sendSuccess(res, result, "Komentar uspješno dodan.", 201);
  } catch (error) {
    console.error("Error inserting comment:", error);
    return sendError(
      res,
      "Greška pri dodavanju komentara.",
      500,
      error.message
    );
  }
});

app.delete("/obrisi_komentar/:id", async (req, res) => {
  try {
    const id_komentara = parseId(req.params.id);

    if (!id_komentara) {
      return sendError(res, "Nedostaje ili nije ispravan ID komentara.", 400);
    }

    const result = await queryAsync(
      "DELETE FROM Komentari WHERE ID_komentara = ?",
      [id_komentara]
    );

    return sendSuccess(res, result, "Komentar je obrisan.");
  } catch (error) {
    console.error("Error deleting comment:", error);
    return sendError(res, "Greška pri brisanju komentara.", 500, error.message);
  }
});

/*
  KORISNICI
*/
app.post("/dodajKorisnika", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return sendError(res, "Email i password su obavezni.", 400);
    }

    const result = await queryAsync(
      "INSERT INTO korisnici_test (email, password) VALUES (?, ?)",
      [email.trim(), password]
    );

    return sendSuccess(res, result, "Korisnik uspješno dodan.", 201);
  } catch (error) {
    console.error("Error adding user:", error);
    return sendError(
      res,
      "Greška pri dodavanju korisnika.",
      500,
      error.message
    );
  }
});

app.get("/korisnici", async (req, res) => {
  try {
    const results = await queryAsync("SELECT * FROM korisnici");
    return sendSuccess(res, results, "Lista korisnika.");
  } catch (error) {
    console.error("Greška pri dohvaćanju korisnika:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju korisnika.",
      500,
      error.message
    );
  }
});

/*
  BRISANJE ATRAKCIJE
*/
app.delete("/obrisi_atrakcije/:id_atrakcije", async (req, res) => {
  try {
    const id_atrakcije = parseId(req.params.id_atrakcije);
    const id_korisnik = parseId(req.query.id_korisnik);
    const uloga = req.query.uloga;

    if (!id_atrakcije) {
      return sendError(res, "Nedostaje ili nije ispravan ID atrakcije.", 400);
    }

    if (uloga === "admin") {
      const deleteResults = await queryAsync(
        "DELETE FROM atrakcije WHERE id_atrakcije = ?",
        [id_atrakcije]
      );

      return sendSuccess(
        res,
        deleteResults,
        "Atrakcija je obrisana od admina."
      );
    }

    if (!id_korisnik) {
      return sendError(res, "Nedostaje ID korisnika.", 400);
    }

    const results = await queryAsync(
      "SELECT * FROM atrakcije WHERE id_atrakcije = ? AND id_korisnik = ?",
      [id_atrakcije, id_korisnik]
    );

    if (!results.length) {
      return sendError(res, "Korisnik nema pravo obrisati ovu atrakciju.", 403);
    }

    const deleteResults = await queryAsync(
      "DELETE FROM atrakcije WHERE id_atrakcije = ? AND id_korisnik = ?",
      [id_atrakcije, id_korisnik]
    );

    return sendSuccess(
      res,
      deleteResults,
      "Atrakcija je obrisana od korisnika."
    );
  } catch (error) {
    console.error("Error deleting attraction:", error);
    return sendError(res, "Greška pri brisanju atrakcije.", 500, error.message);
  }
});

/*
  OCJENE
*/
app.put(
  "/dodajOcjenu/:id",
  authJwt.verifyToken("admin, korisnik"),
  async (req, res) => {
    try {
      const attractionId = parseId(req.params.id);
      const userId = req.userId;
      const rating = req.body.prosjecna_ocjena;

      if (!attractionId) {
        return sendError(res, "Neispravan ID atrakcije.", 400);
      }

      const result = await queryAsync(
        `UPDATE atrakcije 
         SET prosjecna_ocjena = ? 
         WHERE id_atrakcije = ? AND id_korisnik = ?`,
        [rating, attractionId, userId]
      );

      if (result.affectedRows === 0) {
        return sendError(res, "Nema izmjene. Niste ovlašteni.", 403);
      }

      return sendSuccess(res, result, "Ocjena atrakcije ažurirana.");
    } catch (error) {
      console.error("Error updating rating:", error);
      return sendError(
        res,
        "Greška pri ažuriranju ocjene.",
        500,
        error.message
      );
    }
  }
);

app.get("/atrakcijeProsjecneOcjene/:id", async (req, res) => {
  try {
    const attractionId = parseId(req.params.id);

    if (!attractionId) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    const result = await queryAsync(
      "SELECT AVG(ocjena) AS prosjek FROM Ocjena WHERE VK_ID_Atrakcije = ?",
      [attractionId]
    );

    return sendSuccess(res, result, "Prosječna ocjena dohvaćena.");
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return sendError(
      res,
      "Greška pri dohvaćanju prosječne ocjene.",
      500,
      error.message
    );
  }
});

app.post("/dodajOcjenuOcjene/:id", async (req, res) => {
  try {
    const attractionId = parseId(req.params.id);
    const rating = req.body.prosjecna_ocjena;

    if (!attractionId || rating == null) {
      return sendError(res, "Ocjena i ID atrakcije su obavezni.", 400);
    }

    const result = await queryAsync(
      "INSERT INTO Ocjena (ocjena, VK_ID_Atrakcije) VALUES (?, ?)",
      [rating, attractionId]
    );

    return sendSuccess(res, result, "Ocjena uspješno dodana.", 201);
  } catch (error) {
    console.error("Error inserting rating:", error);
    return sendError(res, "Greška pri dodavanju ocjene.", 500, error.message);
  }
});

app.delete("/obrisi_ocjenu_atrakcije/:id/:userId", async (req, res) => {
  try {
    const id_atrakcije = parseId(req.params.id);
    const id_korisnik = parseId(req.params.userId);

    if (!id_atrakcije || !id_korisnik) {
      return sendError(res, "Nedostaje ID atrakcije ili korisnika.", 400);
    }

    const result = await queryAsync(
      `UPDATE atrakcije 
       SET prosjecna_ocjena = NULL 
       WHERE id_atrakcije = ? AND id_korisnik = ?`,
      [id_atrakcije, id_korisnik]
    );

    if (result.affectedRows === 0) {
      return sendError(
        res,
        "Brisanje nije izvršeno. Neovlašten pristup ili zapis ne postoji.",
        403
      );
    }

    return sendSuccess(res, result, "Ocjena atrakcije je obrisana.");
  } catch (error) {
    console.error("Error deleting attraction rating:", error);
    return sendError(
      res,
      "Greška pri brisanju ocjene atrakcije.",
      500,
      error.message
    );
  }
});

/*
  SLIKA ATRAKCIJE
*/
app.delete("/obrisi_sliku_atrakcije/:id", async (req, res) => {
  try {
    const id_atrakcije = parseId(req.params.id);

    if (!id_atrakcije) {
      return sendError(res, "Nedostaje ili nije ispravan ID atrakcije.", 400);
    }

    const result = await queryAsync(
      "UPDATE atrakcije SET slika = NULL WHERE id_atrakcije = ?",
      [id_atrakcije]
    );

    return sendSuccess(res, result, "Slika atrakcije je obrisana.");
  } catch (error) {
    console.error("Error deleting attraction image:", error);
    return sendError(
      res,
      "Greška pri brisanju slike atrakcije.",
      500,
      error.message
    );
  }
});

/*
  AŽURIRANJE ATRAKCIJE
*/
app.put("/updatePost/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const { naziv, opis, adresa } = req.body;

    if (!id) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    const updateFields = [];
    const updateValues = [];

    if (naziv !== undefined) {
      updateFields.push("naziv = ?");
      updateValues.push(naziv);
    }

    if (opis !== undefined) {
      updateFields.push("opis = ?");
      updateValues.push(opis);
    }

    if (adresa !== undefined) {
      updateFields.push("adresa = ?");
      updateValues.push(adresa);
    }

    if (!updateFields.length) {
      return sendError(res, "Nema polja za ažuriranje.", 400);
    }

    updateValues.push(id);

    const updateQuery = `UPDATE atrakcije SET ${updateFields.join(
      ", "
    )} WHERE id_atrakcije = ?`;

    const result = await queryAsync(updateQuery, updateValues);

    return sendSuccess(res, result, "Atrakcija uspješno ažurirana.");
  } catch (error) {
    console.error("Error updating attraction:", error);
    return sendError(
      res,
      "Došlo je do pogreške prilikom ažuriranja atrakcije.",
      500,
      error.message
    );
  }
});

app.put("/atrakcije/azuriraj/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return sendError(res, "Neispravan ID atrakcije.", 400);
    }

    const data = [
      req.body.naziv,
      req.body.opis,
      req.body.slika,
      req.body.prosjecna_ocjena,
      req.body.geografska_sirina,
      req.body.geografska_duzina,
      req.body.adresa,
      id,
    ];

    const result = await queryAsync(
      `UPDATE atrakcije 
       SET naziv = ?, opis = ?, slika = ?, prosjecna_ocjena = ?, 
           geografska_sirina = ?, geografska_duzina = ?, adresa = ?
       WHERE id_atrakcije = ?`,
      data
    );

    return sendSuccess(res, result, "Atrakcija uspješno ažurirana.");
  } catch (error) {
    console.error("Error updating full attraction:", error);
    return sendError(
      res,
      "Greška pri ažuriranju atrakcije.",
      500,
      error.message
    );
  }
});

/*
  AUTH
*/
app.post("/register", async (req, res) => {
  try {
    const { korisnicko_ime, lozinka } = req.body;
    const uloga = "korisnik";

    if (!isNonEmptyString(korisnicko_ime) || !isNonEmptyString(lozinka)) {
      return sendError(res, "Korisničko ime i lozinka su obavezni.", 400);
    }

    const hashedPassword = await bcrypt.hash(lozinka, saltRounds);

    await queryAsync(
      "INSERT INTO korisnici_test (korisnicko_ime, lozinka, uloga) VALUES (?, ?, ?)",
      [korisnicko_ime.trim(), hashedPassword, uloga]
    );

    return sendSuccess(res, null, "Uspješna registracija", 201);
  } catch (error) {
    console.error("Register error:", error);
    return sendError(
      res,
      "Greška prilikom registracije.",
      500,
      error.sqlMessage || error.message
    );
  }
});

app.post("/prijavi", async (req, res) => {
  try {
    const { korisnicko_ime, lozinka } = req.body;

    if (!isNonEmptyString(korisnicko_ime) || !isNonEmptyString(lozinka)) {
      return sendError(res, "Korisničko ime i lozinka su obavezni.", 400);
    }

    const results = await queryAsync(
      "SELECT * FROM korisnici_test WHERE korisnicko_ime = ?",
      [korisnicko_ime.trim()]
    );

    if (!results.length) {
      return sendError(res, "Korisničko ime nije pronađeno.", 404);
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(lozinka, user.lozinka);

    if (!isMatch) {
      return sendError(res, "Neispravno korisničko ime ili lozinka.", 401);
    }

    const token = jwt.sign(
      {
        id: user.id_korisnika,
        uloga: user.uloga,
      },
      config.secret,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(
      res,
      "Problem prilikom prijave.",
      500,
      error.sqlMessage || error.message
    );
  }
});

/*
  HEALTH CHECK
*/
app.get("/", (req, res) => {
  return sendSuccess(res, null, "Backend radi.");
});

/*
  GLOBAL ERROR HANDLER
*/
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  return sendError(res, "Neočekivana greška na serveru.", 500, err.message);
});

app.listen(PORT, () => {
  console.log(`Node app is running on port ${PORT}`);
});
