// ovo treba biti pokrenuto kako bi Axios radio
// pokreće se sa: node index.js

const mysql = require('mysql');
const express = require('express');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
//const conn=require('./connection')

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); 
app.use(express.json({ limit: '50mb' }));
const dbConfig = require("./dbConfig");
const createChatbotRouter = require("./chatbot");

app.use(cors());
//const cors = require('cors');
app.use(cors({ origin: "*" }));




var dbConn = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

//spajanje s bazom
dbConn.connect((err) => {
  if (err) {
    console.error("Greška pri spajanju na bazu:", err.message);
    return;
  }

  console.log("Spojeno na bazu.");
  ensureKomentariKorisnikColumn();
  ensureImageColumnsCanStoreBase64();
});

dbConn.on("error", (err) => {
  console.error("MySQL connection error:", err.message);
});

function ensureKomentariKorisnikColumn() {
  const checkSql = `
    SELECT COUNT(*) AS broj
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Komentari'
      AND COLUMN_NAME = 'VK_ID_korisnika'
  `;

  dbConn.query(checkSql, (checkErr, rows) => {
    if (checkErr) {
      return;
    }

    if (rows[0].broj > 0) {
      return;
    }

    dbConn.query("ALTER TABLE Komentari ADD COLUMN VK_ID_korisnika INT NULL", (alterErr) => {
      if (alterErr) {
        return;
      }

      dbConn.query("CREATE INDEX idx_komentari_korisnik ON Komentari (VK_ID_korisnika)", (indexErr) => {
        if (indexErr) {
          return;
        }

      });
    });
  });
}


function ensureImageColumnsCanStoreBase64() {
  const columns = [
    { table: 'atrakcije', column: 'slika' },
    { table: 'slike', column: 'slika_s' }
  ];

  columns.forEach(({ table, column }) => {
    const checkSql = `
      SELECT DATA_TYPE AS data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `;

    dbConn.query(checkSql, [table, column], (checkErr, rows) => {
      if (checkErr) {
        return;
      }

      if (!rows || rows.length === 0) {
        return;
      }

      const currentType = String(rows[0].data_type || '').toLowerCase();
      if (['mediumtext', 'longtext'].includes(currentType)) {
        return;
      }

      dbConn.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} LONGTEXT NULL`, (alterErr) => {
        if (alterErr) {
          return;
        }

      });
    });
  });
}

function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    dbConn.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}





// Ovo riješava problem: 
// Origin <origin> is not allowed by Access-Control-Allow-Origin
// from origin 'http://localhost:4200' has been blocked by CORS policy
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// kraj fix-a

app.use("/api/chatbot", createChatbotRouter({ queryAsync }));

// Registracija
app.post('/register', async (req, res) => {
  const { korisnicko_ime, lozinka } = req.body;

  if (!korisnicko_ime || !lozinka) {
    return res.send({ success: false, message: "Nedostaju podaci" });
  }

  try {
    // provjera postoji li korisnik
    dbConn.query(
      "SELECT * FROM korisnici_test WHERE korisnicko_ime = ?",
      [korisnicko_ime],
      async (err, results) => {
        if (err) return res.send(err);

        if (results.length > 0) {
          return res.send({ success: false, message: "Korisnik već postoji" });
        }

        // Hash lozinke
        const hashedPassword = await bcrypt.hash(lozinka, 10);

        dbConn.query(
          "INSERT INTO korisnici_test (korisnicko_ime, lozinka) VALUES (?, ?)",
          [korisnicko_ime, hashedPassword],
          (err, result) => {
            if (err) return res.send(err);

            res.send({ success: true, message: "Registracija uspješna" });
          }
        );
      }
    );
  } catch (err) {
    res.send({ success: false, message: "Greška servera" });
  }
});

// Login
// Login
app.post('/login', (req, res) => {
  const { korisnicko_ime, lozinka } = req.body;

  dbConn.query(
    "SELECT * FROM korisnici_test WHERE korisnicko_ime = ?",
    [korisnicko_ime],
    async (err, results) => {
      if (err) return res.send({ success: false, message: "Greška u bazi" });

      if (results.length === 0) {
        return res.send({ success: false, message: "Korisnik ne postoji" });
      }

      const user = results[0];
      const match = await bcrypt.compare(lozinka, user.lozinka);

      if (match) {
        // ŠALJEMO PODATKE FRONTENDU
        res.send({ 
          success: true, 
          user: {
            id: user.id_korisnika, // ili kako se već zove tvoj ID stupac
            korisnicko_ime: user.korisnicko_ime,
            uloga: user.uloga // Ovdje će pisati 'korisnik' ili 'administrator'
          } 
        });
      } else {
        res.send({ success: false, message: "Pogrešna lozinka" });
      }
    }
  );
});

app.post('/unosAtrakcija', function (request, response) {
  const data = request.body;

  const atrakcija = [
    data.naziv,
    data.opis,
    data.slika,
    data.prosjecna_ocjena,
    data.geografska_duzina,
    data.geografska_sirina,
    data.adresa,
    data.id_korisnika
  ];

  dbConn.query(
    "INSERT INTO atrakcije (naziv, opis, slika, prosjecna_ocjena, geografska_duzina, geografska_sirina, adresa, id_korisnika) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    atrakcija,
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results,
        message: 'Atrakcija unesena.'
      });
    }
  );
});
app.post('/dodavanje_slike', function (request, response) {
  const data = request.body;
  slika = [[data.id_atrakcije_s, data.slika_s]]
  
  dbConn.query('INSERT INTO slike (id_atrakcije_s, slika_s ) VALUES ? ',
  [slika], function (error, results, fields) {
  if (error) throw error;
  return response.send({ error: false, data: results, message:'Slika dodana.' });
  });
});
app.post("/api/unos-slike", function (req, res) {
  const data = req.body;
  const slika = data.slika;

  connection.query(
    "INSERT INTO predmet (slika) VALUES (?)",
    [slika],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        return res.status(500).send({
          error: true,
          message: "Dogodila se greška prilikom dodavanja teksta.",
        });
      }
      return res.send({
        error: false,
        data: results,
        message: "Slika je dodana.",
      });
    }
  );
});


//uzimanje podataka o atrakcijama
//racunanje prosjecne ocjene
app.get('/atrakcije', (req, res) => {

  const limit = parseInt(req.query.limit) || 100; // default ako nema limita

  dbConn.query(`
    SELECT 
      a.*, 
      AVG(o.ocjena) AS avg_ocjena
    FROM atrakcije a
    LEFT JOIN Ocjena o 
      ON a.id_atrakcije = o.VK_ID_Atrakcije
    GROUP BY a.id_atrakcije
    LIMIT ?
  `, [limit], (err, result) => {
    if (err) {
      res.send('error');
    } else {
      res.send(result);
    }
  });
});
app.get('/slike', (req,res)=>{
  dbConn.query("select * from slike", (err,result)=>{
      if(err){
          res.send('error');
      }else{
          res.send(result);
      }
  });
});
/// uzimanje podataka o komentarima
app.get("/komentari", function (request, response) {
  dbConn.query(`
    SELECT
      k.*,
      kt.korisnicko_ime AS korisnicko_ime
    FROM Komentari k
    LEFT JOIN korisnici_test kt
      ON kt.id_korisnika = k.VK_ID_korisnika
    ORDER BY k.ID_komentara DESC
  `, function (error, results, fields) {
      if (error) {
          console.error(error);
          return response.status(500).send({
              error: true,
              data: [],
              message: "Greška pri dohvaćanju komentara.",
              details: error.message,
          });
      }
      return response.send({
          error: false,
          data: results,
          message: "lista komentara.",
      });
  });
});


app.get('/komentari/:id', function (request, response) {
let id_atrakcije = request.params.id;
dbConn.query(`
  SELECT
    k.*,
    kt.korisnicko_ime AS korisnicko_ime
  FROM Komentari k
  LEFT JOIN korisnici_test kt
    ON kt.id_korisnika = k.VK_ID_korisnika
  WHERE k.VK_ID_atrakcije = ?
  ORDER BY k.ID_komentara DESC
`, [id_atrakcije], function (error, results, fields) {
    if (error) {
        console.error(error);
        return response.status(500).send({
            error: true,
            data: [],
            message: "Greška pri dohvaćanju komentara.",
            details: error.message,
        });
    }
    return response.send({
        error: false,
        data: results,
        message: "lista komentara.",
    });
});
});
// Dodavanje komentara za atrakciju po ID-u

app.post('/dodajKomentar/:id', (req, res) => {
const data = [req.body.Komentar, req.params.id, req.body.id_korisnika || null]
dbConn.query("INSERT INTO Komentari(Komentar, VK_ID_atrakcije, VK_ID_korisnika) VALUES (?, ?, ?)", data,(err,result)=>{
  if(err){
    console.log(err)
    res.status(500).send({ success: false, message: 'Greška pri dodavanju komentara.' })
  }else{
    res.send({ success: true, data: result })
  }
})
});



//uzimanje podataka o korisnicima
app.get("/korisnici", function (request, response) {
    dbConn.query("SELECT * FROM korisnici", function (error, results, fields) {
        if (error) throw error;
        return response.send({
            error: false,
            data: results,
            message: "lista korisnika.",
        });
    });
});



app.get('/atrakcije/:id', function (request, response) {
  let id_atrakcije = request.params.id;

  dbConn.query(`
 SELECT id_atrakcije, naziv, opis, slika, prosjecna_ocjena, geografska_sirina, geografska_duzina, adresa, id_korisnika
FROM atrakcije
WHERE id_atrakcije = ?
  `, [id_atrakcije], function (error, results) {
    if (error) throw error;

    return response.send({
      data: results[0]
    });
  });
});


/*
app.delete('/atrakcije/id', function (request, response) {
    let id_atrakcije = request.params.id;
    if (!id_atrakcije) {
    return response.status(400).send({ error: true, message:
    'nedostaje id atrakcije' });
    }
    dbConn.query("DELETE * FROM atrakcije WHERE id_atrakcije = ?",[id_atrakcije],
    function (error, results) {
    if (error) throw error;
    return response.send({ error: false, data: results, message:
    'atrakcija je obrisana.' });
    });
});*/


app.delete('/obrisi_atrakcije/:id', function (request, response){

    
    let id_atrakcije = request.params.id;
  
    console.log(`Received request to delete atrakcija with id: ${id_atrakcije}`); // Log the received id
  
    if (!id_atrakcije) {
      return response.status(400).send({ error: true, message: 'nedostaje id atrakcije' });
    }
  
   const deleteQuery = "DELETE  FROM atrakcije WHERE id_atrakcije = ?";
     //const deleteQuery = "DELETE  FROM atrakcije WHERE id_atrakcije = '${id}'";
    dbConn.query(deleteQuery, [id_atrakcije], function (error, results) {
      if (error) {
        console.log(`Error when executing the delete query: ${error}`); // Log any error from the query
        throw error;
      }
  
      console.log('Deletion result: ${JSON.stringify(results)}'); // Log the result of the deletion
  
      return response.send({ error: false, data: results, message: 'atrakcija je obrisana obrisi_atrakcije.' });
    });
  });

// Dodavanje ocjene za atrakciju u tablicu OCJENE
app.post('/dodajOcjenuOcjene/:id', (req, res) => {
  const data = [req.body.ocjena, req.params.id];

  dbConn.query(
    "INSERT INTO Ocjena (ocjena, VK_ID_Atrakcije) VALUES (?, ?)",
    data,
    (err, result) => {
      if(err){
        console.log(err);
        res.send('Error');
      } else {
        res.send(result);
      }
    }
  );
});


//DOHVAT PROSJEČNE OCJENE ZA ATRAKCIJU
app.get('/atrakcijeProsjecneOcjene/:id', (req, res) => {
  const data = [req.params.id]
  //SELECT AVG(ocjena) FROM `Ocjena` WHERE VK_ID_Atrakcije = 141
  dbConn.query("SELECT AVG(ocjena) as prosjek FROM Ocjena WHERE VK_ID_Atrakcije = ?", data,(err,result)=>{
    if(err){
      res.send('Error')
    }else{
      res.send(result)
    }
  })
});

/*
   // Dodavanje ocjene za atrakciju u tablicu OCJENE
 
   app.post('/dodajOcjenuOcjene/:id', (req, res) => {
    const data = [req.body.prosjecna_ocjena, req.params.id]
    //INSERT INTO `Ocjena`( `ocjena`, `VK_ID_Atrakcije`) VALUES (2,141)
    dbConn.query("INSERT INTO Ocjena (ocjena, VK_ID_Atrakcije) VALUES ( ? , ?)", data,(err,result)=>{
      if(err){
        res.send('Error')
      }else{
        res.send(result)
      }
    })
  });
*/ 




  app.delete('/obrisi_sliku_atrakcije/:id', function (request, response){

    let id_atrakcije = request.params.id;
    let id_korisnika = request.query.id_korisnika;

    if (!id_atrakcije) {
      return response.status(400).send({ error: true, message: 'nedostaje id atrakcije' });
    }

    if (!id_korisnika) {
      return response.status(401).send({ error: true, message: 'Morate biti prijavljeni.' });
    }

   const deleteQuery = "UPDATE atrakcije SET slika = NULL WHERE id_atrakcije = ?";

    dbConn.query(deleteQuery, [id_atrakcije], function (error, results) {
      if (error) {
        console.log(`Error when executing the delete query: ${error}`);
        return response.status(500).send({ error: true, message: 'Greška pri brisanju slike.' });
      }

      return response.send({ error: false, data: results, message: 'slika atrakcija je obrisana ' });
    });
  });




/*
  app.delete('/obrisi_ocjenu_atrakcije/:id', function (request, response){

    
    let id_atrakcije = request.params.id;
  
    console.log(`Received request to delete atrakcija with id: ${id_atrakcije}`); // Log the received id
  
    if (!id_atrakcije) {
      return response.status(400).send({ error: true, message: 'nedostaje id atrakcije' });
    }
  
   const deleteQuery = "UPDATE atrakcije SET prosjecna_ocjena = NULL WHERE id_atrakcije = ?";
     //const deleteQuery = "DELETE  FROM atrakcije WHERE id_atrakcije = '${id}'";
    dbConn.query(deleteQuery, [id_atrakcije], function (error, results) {
      if (error) {
        console.log(`Error when executing the delete query: ${error}`); // Log any error from the query
        throw error;
      }
  
      console.log('Deletion result: ${JSON.stringify(results)}'); // Log the result of the deletion
  
      return response.send({ error: false, data: results, message: 'ocjena atrakcija je obrisana ' });
    });
  });

  app.put('/dodaj_sliku_atrakcije/:id', function (request, response){

    
    let id_atrakcije = request.params.id;
  
    console.log(`Received request to delete atrakcija with id: ${id_atrakcije}`); // Log the received id
  
    if (!id_atrakcije) {
      return response.status(400).send({ error: true, message: 'nedostaje id atrakcije' });
    }
  
   const deleteQuery = "UPDATE atrakcije SET slika = ? WHERE id_atrakcije = ?";
     //const deleteQuery = "DELETE  FROM atrakcije WHERE id_atrakcije = '${id}'";
    dbConn.query(deleteQuery,[slika],[id_atrakcije], function (error, results) {
      if (error) {
        console.log(`Error when executing the delete query: ${error}`); // Log any error from the query
        throw error;
      }
  
      console.log('Deletion result: ${JSON.stringify(results)}'); // Log the result of the deletion
  
      return response.send({ error: false, data: results, message: 'slika atrakcija je obrisana ' });
    });
  });*/


  app.delete('/obrisi_ocjenu_atrakcije/:id', function (request, response){

    let id_atrakcije = request.params.id;
    let id_korisnika = request.query.id_korisnika;

    if (!id_atrakcije) {
      return response.status(400).send({ error: true, message: 'nedostaje id atrakcije' });
    }

    if (!id_korisnika) {
      return response.status(401).send({ error: true, message: 'Morate biti prijavljeni.' });
    }

    dbConn.query("DELETE FROM Ocjena WHERE VK_ID_Atrakcije = ?", [id_atrakcije], function (deleteError, deleteResults) {
      if (deleteError) {
        console.log(deleteError);
        return response.status(500).send({ error: true, message: 'Greška pri resetiranju ocjena.' });
      }

      dbConn.query("UPDATE atrakcije SET prosjecna_ocjena = NULL WHERE id_atrakcije = ?", [id_atrakcije], function (updateError) {
        if (updateError) {
          console.log(updateError);
          return response.status(500).send({ error: true, message: 'Greška pri resetiranju prosječne ocjene.' });
        }

        return response.send({ error: false, data: deleteResults, message: 'ocjene atrakcije su resetirane ' });
      });
    });
  });
//brisanje komentara

app.delete('/obrisi_komentar/:id', function (request, response){

    
  let id_komentara = request.params.id;

  console.log(`Received request to delete komentar with id: ${id_komentara}`); // Log the received id

  if (!id_komentara) {
    return response.status(400).send({ error: true, message: 'nedostaje id komentara' });
  }

 const deleteQuery = "DELETE  FROM Komentari WHERE ID_komentara = ?";
  dbConn.query(deleteQuery, [id_komentara], function (error, results) {
    if (error) {
      console.log(`Error when executing the delete query: ${error}`); // Log any error from the query
      throw error;
    }

    console.log('Deletion result: ${JSON.stringify(results)}'); // Log the result of the deletion

    return response.send({ error: false, data: results, message: 'komentar je obrisan obrisi komentar.' });
  });
});

  app.put('/atrakcije/azuriraj/:id', (req, res) => {
    const id_korisnika = req.body.id_korisnika;

    if (!id_korisnika) {
      return res.status(401).send({ error: true, message: 'Morate biti prijavljeni.' });
    }

    const data = [
      req.body.naziv,
      req.body.opis,
      req.body.slika,
      req.body.prosjecna_ocjena,
      req.body.geografska_sirina,
      req.body.geografska_duzina,
      req.body.adresa,
      req.params.id
    ]

    dbConn.query("UPDATE atrakcije SET naziv = ?, opis = ?, slika = ?, prosjecna_ocjena = ?, geografska_sirina = ?, geografska_duzina = ?, adresa = ? WHERE id_atrakcije = ?", data,(err,result)=>{
      if(err){
        return res.status(500).send({ error: true, message: 'Greška pri uređivanju atrakcije.', details: err.message })
      }

      res.send({ error: false, data: result, message: 'Atrakcija je uspješno uređena.' })
    })
  });

app.put('/dodajSliku/:id', (req, res) => {
  const id_atrakcije = req.params.id;
  const { slika, id_korisnika } = req.body;

  if (!id_korisnika) {
    return res.status(401).send({ error: true, message: 'Morate biti prijavljeni.' });
  }

  if (!slika) {
    return res.status(400).send({ error: true, message: 'Nedostaje slika.' });
  }

  dbConn.query(
    "UPDATE atrakcije SET slika = ? WHERE id_atrakcije = ?",
    [slika, id_atrakcije],
    function (error, results) {
      if (error) {
        console.log(error);
        return res.status(500).send({ error: true, message: 'Greška pri dodavanju slike.' });
      }

      return res.send({ error: false, data: results, message: 'Slika je uspješno dodana.' });
    }
  );
});

app.delete('/atrakcije/obrisi/:id_atrakcije/:id_korisnika', function (request, response) {
  const id_atrakcije = request.params.id_atrakcije;
  const id_korisnika = request.params.id_korisnika;

  dbConn.query(
    "DELETE FROM atrakcije WHERE id_atrakcije = ? AND id_korisnika = ?",
    [id_atrakcije, id_korisnika],
    function (error, results, fields) {
      if (error) throw error;

      if (results.affectedRows === 0) {
        return response.status(403).send({
          error: true,
          message: "Nemate pravo obrisati ovu atrakciju."
        });
      }

      return response.send({
        error: false,
        data: results,
        message: "Atrakcija je uspješno obrisana."
      });
    }
  );
});

  app.post("/dodajSlikuAtrakciji", async (req, res) => {
    try {
      const { id_atrakcije, slika, id_korisnika } = req.body;

      dbConn.query(
        `
      INSERT INTO slike
      (id_atrakcije_s, slika_s, id_korisnika)
      VALUES (?, ?, ?)
      `,
        [id_atrakcije, slika, id_korisnika],

        function (error, results, fields) {
          if (error) {
            console.error(error);

            return res.status(500).json({
              success: false,
              error: "Greška pri spremanju slike.",
            });
          }

          return res.json({
            success: true,
            message: "Slika uspješno spremljena.",
          });
        },
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        error: "Greška pri spremanju slike.",
      });
    }
  });
  app.get("/dohvatiAtrakcije", async (req, res) => {
    try {
      dbConn.query(
        `
      SELECT *
      FROM atrakcije
      `,

        function (error, results, fields) {
          if (error) {
            console.error(error);

            return res.status(500).json({
              error: "Greška pri dohvaćanju atrakcija.",
            });
          }

          return res.json(results);
        },
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška pri dohvaćanju atrakcija.",
      });
    }
  });
  app.get("/dohvatiSveSlike", async (req, res) => {
    try {
      dbConn.query(
        `
      SELECT

        slike.id_slike,
        slike.slika_s,
        slike.id_korisnika,

        atrakcije.naziv,
        atrakcije.id_atrakcije

      FROM slike

      INNER JOIN atrakcije
      ON slike.id_atrakcije_s = atrakcije.id_atrakcije
      `,

        function (error, results, fields) {
          if (error) {
            console.error(error);

            return res.status(500).json({
              error: "Greška pri dohvaćanju slika.",
            });
          }

          return res.json(results);
        },
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška pri dohvaćanju slika.",
      });
    }
  });
  app.get("/dohvatiSveSlike", async (req, res) => {
    try {
      dbConn.query(
        `
      SELECT

        slike.id_slike,
        slike.slika_s,

        atrakcije.naziv,
        atrakcije.id_atrakcije

      FROM slike

      INNER JOIN atrakcije
      ON slike.id_atrakcije_s = atrakcije.id_atrakcije
      `,

        function (error, results, fields) {
          if (error) {
            console.error(error);

            return res.status(500).json({
              error: "Greška pri dohvaćanju slika.",
            });
          }

          return res.json(results);
        },
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška pri dohvaćanju slika.",
      });
    }
  });
  app.delete("/obrisiSliku/:id", function (request, response) {
    let id_slike = request.params.id;
    let id_korisnika = request.query.id_korisnika;

    if (!id_slike) {
      return response.status(400).send({
        error: true,
        message: "nedostaje id slike",
      });
    }

    if (!id_korisnika) {
      return response.status(401).send({
        error: true,
        message: "Morate biti prijavljeni.",
      });
    }

    const deleteQuery = "DELETE FROM slike WHERE id_slike = ? AND id_korisnika = ?";

    dbConn.query(
      deleteQuery,
      [id_slike, id_korisnika],

      function (error, results) {
        if (error) {
          console.log(error);

          return response.status(500).send({
            error: true,
            message: "greška pri brisanju slike",
          });
        }

        if (results.affectedRows === 0) {
          return response.status(403).send({
            error: true,
            message: "Nemate pravo obrisati ovu sliku.",
          });
        }

        return response.send({
          error: false,
          data: results,
          message: "slika obrisana",
        });
      },
    );
  });
  app.get("/dohvatiSlikeAtrakcije/:id", async (req, res) => {
    try {
      dbConn.query(
        `
      SELECT
        id_slike,
        slika_s,
        id_korisnika
      FROM slike
      WHERE id_atrakcije_s = ?
      `,
        [req.params.id],
        function (error, results) {
          if (error) {
            return res.status(500).json({
              error: "Greška pri dohvaćanju slika.",
            });
          }

          return res.json(results);
        },
      );
    } catch (error) {
      res.status(500).json({
        error: "Greška pri dohvaćanju slika.",
      });
    }
  });
//port na kojem je app
app.listen(4200, function () {
console.log('Node app is running on port 4200');
});
//module.exports = app;


