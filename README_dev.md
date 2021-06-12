SETUP:
1. Asenna WebStrom(tutustumis versio)
2. Avaa repo webstormissa
3. Tee oma run:
    - Avaa valikko oikealta ylhäältä ja valitse "Add Configuration..."
    - Paina '+' ja valitse "JavaScript Debug"
    - Anna nimi esim. "Run"
    - Valitse URL osoittamaan index.html
    - Valitse mieleinen Browser
    - Before launch lisää Compile TypeScript (valitse tsconfig.json)
    - Voit kokeilla ajaa koodia painamalla Play näppäinta tai
4. Säädä File->Settings->Editor->Code Style->TypeScript
    - Käytetään Tabeja
5. Ota auto format käyttöön
    - Mene File->Settings->Languages & Frameworks -> TypeScript ->TSLint
    - valitse Automatic
    - Paina hiiren 2. oikealla tiedostoon "tslint.json" ja valitse (listan alhaalta) "Apply TSLint code style rules"
    - Nyt voit painaa "Ctrl + Alt + L" automaattisesti formatoidaksesi koodin (Linuxissa saatat joutua uudelleen mappaamaan tämän)
6. Lisäsäätöjä browserify:ta varten, tämä yhdistelee paketteja yhdeksi, systemjs:n käyttö oli hankalampaa
    - Ladataan paketti "browserify":
      - File->Settings->Languages & Frameworks->Node.js and NPM
      - Valitse '+' 
      - Etsi paketti nimeltä "browserify"
      - Valitse checkbox "Options:" ja kirjoita "-g" (asennetaan paketti globaalisti)
      - Asenna
   - Lisätään browserify käsky:
      - Valitse Edit Configuration **oikealta** ylhäältä (itsellä lukee siinä aluksi että Run)
      - Lisätään Runiin kääntämisen jälkeen steppi Run external tool
        - nimeä miten haluat: Browserify, (run browserify)
        - Program browserify.cmd
        - Options: tmp/main.js --outfile public/bundle.js
        - Working directory: $ProjectFileDir$/
        - Jos ei toimi, kokeile ajaa browserify.cmd komentorivillä, itsellä tämä toimi kyllä suorilta

Workflow:

- Kaikki koodi src/ kansioon. Alihakemistoja saa tehdä harkintansa mukaan.
- Kaikki kuvat ja musiikki data/ kansioon
- public/ kansioon sellaista mitä tarvitsee ajamiseen, mutta ei mitään generoitua gittiin ennen kuin Hillo on valmista
