# compendiovicorum-crawler

[![Build Status][ico-github-actions]][link-github-actions]
[![Known Vulnerabilities][ico-snyk]][link-snyk]
[![JavaScript Style Guide][ico-standard]][link-standard]

A crawler that reads all the 'comune' data from italian Wikipedia. This crawler will be used to retrieve and insert all the 'comuni' information in a [MongoDB](http://www.mongodb.org/) database. It parses data that is in the right column.

## Installation

```bash
$ npm install compendiovicorum-crawler
```

## Usage

Start your MongoDB server and edit `config.js` file.
Then you could run:

```bash
$ node app.js
```

## Output

The structure of insterted documents is this:

```json
{
    "nome": "Abano Terme",
    "tipo": "comune",
    "stemma": "http://upload.wikimedia.org/wikipedia/it/7/79/Abano_Terme-Stemma.png",
    "bandiera": "http://upload.wikimedia.org/wikipedia/it/5/50/Abano_Terme-Gonfalone.png",
    "stato": "Italia",
    "regione": "Veneto",
    "provincia": "Padova",
    "sindaco": {
        "nome": "Luca Claudio",
        "partito": "lista civica di centro-destra Luca Claudio sindaco",
        "inizioCarica": "30/05/2011"
    },
    "latitudine": "45°21′42.84″N",
    "longitudine": "11°47′32.64″E",
    "altitudine": "14 m s.l.m.",
    "superficie": "21,41 km²",
    "abitanti": "19 349",
    "censimento": "31.12.2011",
    "frazioni": [
        "Feriole",
        "Giarre",
        "Monteortone",
        "Monterosso"
    ],
    "comuniConfinanti": [
        "Albignasego",
        "Due Carrare",
        "Maserà di Padova",
        "Montegrotto Terme",
        "Padova",
        "Selvazzano Dentro",
        "Teolo",
        "Torreglia"
    ],
    "codicePostale": [
        "35031"
    ],
    "prefisso": "049",
    "fusoOrario": "UTC+1",
    "codiceIstat": "028001",
    "targa": "PD",
    "classificazioneSismica": "zona 4 (sismicità molto bassa)",
    "classificazioneClimatica": "zona E, 2 383 GG",
    "nomeAbitanti": "aponensi",
    "patrono": "San Lorenzo martire",
    "giornoFestivo": "10 agosto",
    "sitoIstituzionale": "http://www.comune.abanoterme.pd.it/"
}
```

## Issues

If you have issues, just open one [here](https://github.com/CompendioVicorum/compendiovicorum-crawler/issues).


[ico-github-actions]: https://github.com/CompendioVicorum/compendiovicorum-crawler/workflows/Run%20tests/badge.svg?branch=master
[ico-snyk]: https://snyk.io/test/github/compendiovicorum/compendiovicorum-crawler/badge.svg
[ico-standard]: https://img.shields.io/badge/code_style-standard-brightgreen.svg

[link-github-actions]: https://github.com/CompendioVicorum/compendiovicorum-crawler/actions?query=workflow%3A%22Run+tests%22
[link-snyk]: https://snyk.io/test/github/compendiovicorum/compendiovicorum-crawler
[link-standard]: https://standardjs.com