ALTER TABLE Komentari
  ADD COLUMN VK_ID_korisnika INT NULL;

CREATE INDEX idx_komentari_korisnik
  ON Komentari (VK_ID_korisnika);
