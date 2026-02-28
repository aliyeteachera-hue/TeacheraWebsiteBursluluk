import type { PlacementExamBank, PlacementExamKey } from './placementExamData';

export const PDF_PLACEMENT_BANKS = {
  "de-general": {
    "key": "de-general",
    "title": "Almanca Placement Test",
    "languageId": "de",
    "ageScope": "13+",
    "sourceFileName": "Almanca Level Test.pdf",
    "placementBands": [
      {
        "min": 1,
        "max": 12,
        "label": "Buch 1"
      },
      {
        "min": 13,
        "max": 24,
        "label": "Buch 2"
      },
      {
        "min": 25,
        "max": 36,
        "label": "Buch 3"
      },
      {
        "min": 37,
        "max": 48,
        "label": "Buch 4"
      },
      {
        "min": 49,
        "max": 60,
        "label": "Buch 5"
      }
    ],
    "questions": [
      {
        "id": "q-001",
        "prompt": "Berlin ist eine Stadt.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-002",
        "prompt": "Er ist 18 Jahre alt. Er ist alt.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-003",
        "prompt": "Zum Geburtstag kaufe ich meinem Mann einen Schal. Ich kaufe einen Schal für ihn.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-004",
        "prompt": "Tee ohne Zucker ist süß.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-005",
        "prompt": "Sie liest gern. Sie mag lesen.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-006",
        "prompt": "Wenn die Leute traurig sind, lachen sie.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-007",
        "prompt": "Du machst das Licht aus, wenn es in der Nacht dunkel ist und du ein Buch lesen möchtest.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-008",
        "prompt": "Die Ferien sind länger als das Schuljahr.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-009",
        "prompt": "Ich plane, meinen Urlaub zu Hause zu verbringen. Ich werde nicht nach Deutschland fahren.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-010",
        "prompt": "Vor einer Stunde bist du ins Ausland gefahren.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-011",
        "prompt": "Heute ist der einunddreißigste Mai. Übermorgen ist der zweite Juni.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-012",
        "prompt": "Es regnet. Trotzdem müssen die Arbeiter zur Arbeit fahren.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-013",
        "prompt": "Ich zahlte Geld auf mein Konto ein. Jetzt erzähle ich über meine Zukunft.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-014",
        "prompt": "Der Man hilft seiner Frau beim Aufräumen, indem er die ganze Zeit schläft.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-015",
        "prompt": "In einer alten Zeitung kann man nur aktuelle Informationen finden.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-016",
        "prompt": "Ich habe Kopfschmerzen bedeutet mein Kopf tut mir weh.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-017",
        "prompt": "Du hast ein Buch geliehen. Das Buch gehört dir.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-018",
        "prompt": "Kein Gebirge in Europa ist höher als die Alpen. Alpen sind am höchsten.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-019",
        "prompt": "Die Kleidung muss gewaschen werden.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-020",
        "prompt": "Der Chef wird von seinem Arbeiter angestellt.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-021",
        "prompt": "Angst ist ein positives Gefühl.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-022",
        "prompt": "Das Kind, dem die Eltern etwas verbieten, ist ihnen in der Regel dankbar.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-023",
        "prompt": "Die Architektin ist die Frau, die Baupläne anfertigt.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-024",
        "prompt": "Der Zug, aus dem alle Reisenden schon ausgestiegen sind, ist voll.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-025",
        "prompt": "Die Leute können mit ihren Bekannten telefonieren, obwohl sie nicht mehr leben.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-026",
        "prompt": "Wir hätten viele Freunde auf einer einsamen Insel.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-027",
        "prompt": "Wenn das Opfer eines schweren Unfalls nicht rechtzeitig ins Krankenhaus gekommen wäre, wäre es gestorben.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-028",
        "prompt": "Umweltfreundliche Produkte verursachen keine Umweltzerstörung.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-029",
        "prompt": "Die Wolkenkratzer sind so hoch, dass sie scheinen, die Wolken zu berühren.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "richtig",
        "wrongPenalty": -1
      },
      {
        "id": "q-030",
        "prompt": "Es ist gut, wenn der Kontostand den Ausschlag für die Wahl des Lebenspartners gibt.",
        "options": [
          "richtig",
          "falsch"
        ],
        "answer": "falsch",
        "wrongPenalty": -1
      },
      {
        "id": "q-031",
        "prompt": "Frau Schmitt, wie ist ___________ Telefonnummer?",
        "options": [
          "dein",
          "meine",
          "Ihre"
        ],
        "answer": "Ihre",
        "wrongPenalty": -1
      },
      {
        "id": "q-032",
        "prompt": "___________ ist das? Das ist Anna.",
        "options": [
          "Was?",
          "Wie?",
          "Wer?"
        ],
        "answer": "Wer?",
        "wrongPenalty": -1
      },
      {
        "id": "q-033",
        "prompt": "Die Leute sprechen über ___________ Buch.",
        "options": [
          "einen",
          "eine",
          "ein"
        ],
        "answer": "ein",
        "wrongPenalty": -1
      },
      {
        "id": "q-034",
        "prompt": "___________ waren wir am Mittelmeer.",
        "options": [
          "Morgen",
          "Am Wochenende",
          "Jetzt"
        ],
        "answer": "Am Wochenende",
        "wrongPenalty": -1
      },
      {
        "id": "q-035",
        "prompt": "Das ist der Computer ___________.",
        "options": [
          "der Informatiker",
          "den Informatikern",
          "des Informatikers"
        ],
        "answer": "des Informatikers",
        "wrongPenalty": -1
      },
      {
        "id": "q-036",
        "prompt": "Er findet, ___________ er alles weiß.",
        "options": [
          "wenn",
          "ob",
          "dass"
        ],
        "answer": "dass",
        "wrongPenalty": -1
      },
      {
        "id": "q-037",
        "prompt": "Wir befinden ___________ in der Nähe.",
        "options": [
          "uns",
          "euch",
          "sich"
        ],
        "answer": "uns",
        "wrongPenalty": -1
      },
      {
        "id": "q-038",
        "prompt": "Dein Hund ist so ___________ wie meine Katze.",
        "options": [
          "groß",
          "großer",
          "größer"
        ],
        "answer": "groß",
        "wrongPenalty": -1
      },
      {
        "id": "q-039",
        "prompt": "Es ist möglich, 10 Wörter auswendig ___________.",
        "options": [
          "lernen",
          "zu lernen",
          "gelernt"
        ],
        "answer": "zu lernen",
        "wrongPenalty": -1
      },
      {
        "id": "q-040",
        "prompt": "Der Fernseher steht ___________ Wohnzimmer.",
        "options": [
          "nach",
          "ins",
          "im"
        ],
        "answer": "im",
        "wrongPenalty": -1
      },
      {
        "id": "q-041",
        "prompt": "Die Mutter kauft eine Schokolade, ___________.",
        "options": [
          "um die Kinder zu essen",
          "um sie zu essen",
          "damit die Schokolade isst"
        ],
        "answer": "um sie zu essen",
        "wrongPenalty": -1
      },
      {
        "id": "q-042",
        "prompt": "Die Eltern sind stolz auf die Kinder, weil sie ___________.",
        "options": [
          "einen Job verloren haben",
          "faul gewesen sind",
          "einen Erfolg erreicht haben"
        ],
        "answer": "einen Erfolg erreicht haben",
        "wrongPenalty": -1
      },
      {
        "id": "q-043",
        "prompt": "Möchtest du viel Geld verdienen, ohne ___________?",
        "options": [
          "du viel arbeitest",
          "viel zu arbeiten",
          "viel arbeiten"
        ],
        "answer": "viel zu arbeiten",
        "wrongPenalty": -1
      },
      {
        "id": "q-044",
        "prompt": "_________ ich am Montag mit ihm sprach, lachte er mich aus.",
        "options": [
          "Als",
          "Falls",
          "Wenn"
        ],
        "answer": "Als",
        "wrongPenalty": -1
      },
      {
        "id": "q-045",
        "prompt": "Ich rufe dich morgen ___________.",
        "options": [
          "zu dir",
          "an",
          "mit"
        ],
        "answer": "an",
        "wrongPenalty": -1
      },
      {
        "id": "q-046",
        "prompt": "Wenn der Kellner dem Gast Essen bringt, beginnt der Gast ___________.",
        "options": [
          "frühstückt",
          "frühstücken",
          "zu frühstücken"
        ],
        "answer": "zu frühstücken",
        "wrongPenalty": -1
      },
      {
        "id": "q-047",
        "prompt": "Der Arzt untersucht ___________.",
        "options": [
          "der Patient",
          "den Patient",
          "den Patienten"
        ],
        "answer": "den Patienten",
        "wrongPenalty": -1
      },
      {
        "id": "q-048",
        "prompt": "Die Kinder sollen nicht mit den Streichhölzern spielen, ___________ können sie das Haus in Brand setzen.",
        "options": [
          "sonst",
          "deshalb",
          "dadurch dass"
        ],
        "answer": "sonst",
        "wrongPenalty": -1
      },
      {
        "id": "q-049",
        "prompt": "Von einem durchschnittlichen Leser werden 2 Bücher pro Jahr ___________.",
        "options": [
          "liest",
          "lesen",
          "gelesen"
        ],
        "answer": "gelesen",
        "wrongPenalty": -1
      },
      {
        "id": "q-050",
        "prompt": "Gestern ___________ mein Auto geklaut.",
        "options": [
          "wird",
          "wurde",
          "ist"
        ],
        "answer": "wurde",
        "wrongPenalty": -1
      },
      {
        "id": "q-051",
        "prompt": "Die Eltern lassen ___________ mein Zimmer aufräumen.",
        "options": [
          "ich",
          "mich",
          "mir"
        ],
        "answer": "mich",
        "wrongPenalty": -1
      },
      {
        "id": "q-052",
        "prompt": "Die Autos sind ___________ transportiert worden.",
        "options": [
          "nach Schweiz",
          "in die Schweiz",
          "in der Schweiz"
        ],
        "answer": "in die Schweiz",
        "wrongPenalty": -1
      },
      {
        "id": "q-053",
        "prompt": "Columbus entdeckte Amerika, ___________ Barack Obama zum Präsidenten von den Vereinigten Staaten gewählt wurde.",
        "options": [
          "als",
          "nachdem",
          "bevor"
        ],
        "answer": "bevor",
        "wrongPenalty": -1
      },
      {
        "id": "q-054",
        "prompt": "Ich weiß nicht, wie alt er ist. Ich muss mich bei ihm _______ .",
        "options": [
          "fragen",
          "erfahren",
          "erkundigen"
        ],
        "answer": "erkundigen",
        "wrongPenalty": -1
      },
      {
        "id": "q-055",
        "prompt": "___________ nächster Woche fange ich an, mehr zu lernen.",
        "options": [
          "Ab",
          "Durch",
          "Seit"
        ],
        "answer": "Ab",
        "wrongPenalty": -1
      },
      {
        "id": "q-056",
        "prompt": "Wenn ich meinen Kugelschreiber vergessen würde, ___________ ich einen Kugelschreiber leihen.",
        "options": [
          "muss",
          "musste",
          "müsste"
        ],
        "answer": "müsste",
        "wrongPenalty": -1
      },
      {
        "id": "q-057",
        "prompt": "Der Mann, dessen Sohn dein Bruder ist, ist am öftesten ____ .",
        "options": [
          "dein Vater",
          "dein Opa",
          "dein Schwager"
        ],
        "answer": "dein Vater",
        "wrongPenalty": -1
      },
      {
        "id": "q-058",
        "prompt": "Der Fahrer fährt zu schnell. Er _________ gegen das Gesetz.",
        "options": [
          "bricht",
          "verstößt",
          "überschreitet"
        ],
        "answer": "verstößt",
        "wrongPenalty": -1
      },
      {
        "id": "q-059",
        "prompt": "Er spielt Lotto. Er ___________ .",
        "options": [
          "kreuzt 6 Zahlen durch",
          "durchkreuzt 6 Zahlen",
          "wird durchgekreuzt"
        ],
        "answer": "kreuzt 6 Zahlen durch",
        "wrongPenalty": -1
      },
      {
        "id": "q-060",
        "prompt": "Der Betrüger wollte eine alte Frau ___________.",
        "options": [
          "hereinlegen",
          "herabsetzen",
          "begründen"
        ],
        "answer": "hereinlegen",
        "wrongPenalty": -1
      }
    ]
  },
  "fr-general": {
    "key": "fr-general",
    "title": "Fransızca Placement Test",
    "languageId": "fr",
    "ageScope": "13+",
    "sourceFileName": "Fransızca Seviye Tespit.pdf",
    "placementBands": [
      {
        "min": 0,
        "max": 20,
        "label": "Livre 1",
        "cefr": "A1"
      },
      {
        "min": 21,
        "max": 40,
        "label": "Livre 2",
        "cefr": "A2"
      },
      {
        "min": 41,
        "max": 56,
        "label": "Livre 3"
      },
      {
        "min": 57,
        "max": 60,
        "label": "Livre 4",
        "cefr": "B1"
      }
    ],
    "questions": [
      {
        "id": "q-001",
        "prompt": "Elle n’est pas présente, elle est absente.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-002",
        "prompt": "Il est majeur, il a quinze ans.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-003",
        "prompt": "L’automne est après l’été.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-004",
        "prompt": "Les livres intéressants sont ennuyeux.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-005",
        "prompt": "Pour voyager je n’ai pas besoin d’argent.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-006",
        "prompt": "Quand ils n’ont pas raison, ils ont tort.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-007",
        "prompt": "Quand on est sportif, on n’est pas musclé.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-008",
        "prompt": "On se repose quand on est en vacances.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-009",
        "prompt": "Je prends mon temps, je me dépêche.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-010",
        "prompt": "Je sais conduire, j’ai le permis de conduire.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-011",
        "prompt": "En hiver, il y a du soleil et il fait très chaud.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-012",
        "prompt": "Quand il pleut, je ne prends pas de parapluie.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-013",
        "prompt": "Nous allons au marché pour acheter des fruits.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-014",
        "prompt": "Je fais les courses avant la fête.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-015",
        "prompt": "Le garage est au sous-sol.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-016",
        "prompt": "Je dis au revoir en partant.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-017",
        "prompt": "Vous lisez le journal tout en conduisant.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-018",
        "prompt": "J’adore voyager, je suis un grand voyageur.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-019",
        "prompt": "La France se trouve à l’ouest de l’Europe.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-020",
        "prompt": "On ne fait pas de sport dans le gymnase.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-021",
        "prompt": "C’est une erreur, vous avez fait un mauvais numéro.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-022",
        "prompt": "On ne peut pas envoyer une lettre avec accusé de réception.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-023",
        "prompt": "Ça sonne occupé, vous vous êtes trompé de numéro.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-024",
        "prompt": "Je vais à la poste parce que j’ai reçu un avis.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-025",
        "prompt": "Pour conduire il faut avoir la carte d’identité.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-026",
        "prompt": "Je me sens très bien, je suis en pleine forme.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-027",
        "prompt": "On va voir un cardiologue pour prendre soin de son cœur.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-028",
        "prompt": "Le décollage c’est quand l’avion vole.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-029",
        "prompt": "Le vol est direct, vous avez une correspondance à Paris.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "faux",
        "wrongPenalty": -1
      },
      {
        "id": "q-030",
        "prompt": "La boulangerie vend du pain.",
        "options": [
          "vrai",
          "faux"
        ],
        "answer": "vrai",
        "wrongPenalty": -1
      },
      {
        "id": "q-031",
        "prompt": "Mardi est .......... lundi et mercredi.",
        "options": [
          "avant",
          "entre",
          "après"
        ],
        "answer": "entre",
        "wrongPenalty": -1
      },
      {
        "id": "q-032",
        "prompt": "C’est ......... mois de janvier.",
        "options": [
          "en",
          "au",
          "dans"
        ],
        "answer": "au",
        "wrongPenalty": -1
      },
      {
        "id": "q-033",
        "prompt": "Elle ....... besoin de temps libre.",
        "options": [
          "a",
          "as",
          "est"
        ],
        "answer": "a",
        "wrongPenalty": -1
      },
      {
        "id": "q-034",
        "prompt": "Nous ............... en juillet.",
        "options": [
          "habitons",
          "avons",
          "sommes"
        ],
        "answer": "sommes",
        "wrongPenalty": -1
      },
      {
        "id": "q-035",
        "prompt": "J’.............. dans une maison moderne.",
        "options": [
          "habites",
          "habitent",
          "habite"
        ],
        "answer": "habite",
        "wrongPenalty": -1
      },
      {
        "id": "q-036",
        "prompt": "J’adore ............. .",
        "options": [
          "visiter",
          "visite",
          "visitent"
        ],
        "answer": "visiter",
        "wrongPenalty": -1
      },
      {
        "id": "q-037",
        "prompt": "Je suis ........ bonne santé.",
        "options": [
          "la",
          "au",
          "en"
        ],
        "answer": "en",
        "wrongPenalty": -1
      },
      {
        "id": "q-038",
        "prompt": "De ............. nationalité êtes-vous?",
        "options": [
          "quelles",
          "quelle",
          "quel"
        ],
        "answer": "quelle",
        "wrongPenalty": -1
      },
      {
        "id": "q-039",
        "prompt": "Tu ........... prendre la voiture.",
        "options": [
          "peut",
          "peux",
          "peuvent"
        ],
        "answer": "peux",
        "wrongPenalty": -1
      },
      {
        "id": "q-040",
        "prompt": "Tu as mal ...... dos.",
        "options": [
          "au",
          "à la",
          "aux"
        ],
        "answer": "au",
        "wrongPenalty": -1
      },
      {
        "id": "q-041",
        "prompt": "Ils voyagent ............. leurs amis.",
        "options": [
          "autant",
          "autant que",
          "autant de"
        ],
        "answer": "autant que",
        "wrongPenalty": -1
      },
      {
        "id": "q-042",
        "prompt": "Elle parle .............. langues étrangères.",
        "options": [
          "certains",
          "certaines",
          "plusieurs"
        ],
        "answer": "plusieurs",
        "wrongPenalty": -1
      },
      {
        "id": "q-043",
        "prompt": "J’ai acheté un dictionnaire ........... deux jours.",
        "options": [
          "dans",
          "il y a",
          "pour"
        ],
        "answer": "il y a",
        "wrongPenalty": -1
      },
      {
        "id": "q-044",
        "prompt": "Il est célèbre, mais pas ............ célèbre.",
        "options": [
          "le plus",
          "la plus",
          "les plus"
        ],
        "answer": "le plus",
        "wrongPenalty": -1
      },
      {
        "id": "q-045",
        "prompt": "J’ai ........... l’Andalousie.",
        "options": [
          "visité",
          "regardé",
          "commandé"
        ],
        "answer": "visité",
        "wrongPenalty": -1
      },
      {
        "id": "q-046",
        "prompt": "Hier, j’ai ...... faire les courses.",
        "options": [
          "du",
          "dû",
          "de"
        ],
        "answer": "dû",
        "wrongPenalty": -1
      },
      {
        "id": "q-047",
        "prompt": "Nous avons la ........... d’Espagne.",
        "options": [
          "plan",
          "guide",
          "carte"
        ],
        "answer": "carte",
        "wrongPenalty": -1
      },
      {
        "id": "q-048",
        "prompt": "Un sandwich ...... fromage et un café.",
        "options": [
          "aux",
          "au",
          "avec"
        ],
        "answer": "au",
        "wrongPenalty": -1
      },
      {
        "id": "q-049",
        "prompt": "Nous avons une ..................... à l’hôtel.",
        "options": [
          "renseignement",
          "réservation",
          "itinéraire"
        ],
        "answer": "réservation",
        "wrongPenalty": -1
      },
      {
        "id": "q-050",
        "prompt": "Nous avons ............. une assurance annulation.",
        "options": [
          "achetés",
          "achetée",
          "acheté"
        ],
        "answer": "acheté",
        "wrongPenalty": -1
      },
      {
        "id": "q-051",
        "prompt": "Il y a des embouteillages .............. Paris et Versailles.",
        "options": [
          "vers",
          "entre",
          "parmi"
        ],
        "answer": "entre",
        "wrongPenalty": -1
      },
      {
        "id": "q-052",
        "prompt": "La semaine dernière nous ............... au cinéma tous les jours.",
        "options": [
          "sommes allés",
          "allions",
          "étions allés"
        ],
        "answer": "sommes allés",
        "wrongPenalty": -1
      },
      {
        "id": "q-053",
        "prompt": "A votre place, je ...................... plus de sport.",
        "options": [
          "fairais",
          "ferait",
          "ferais"
        ],
        "answer": "ferais",
        "wrongPenalty": -1
      },
      {
        "id": "q-054",
        "prompt": "Je ........................... parler avec vous.",
        "options": [
          "j’ai souhaité",
          "souhaitais",
          "souhaitent"
        ],
        "answer": "souhaitais",
        "wrongPenalty": -1
      },
      {
        "id": "q-055",
        "prompt": "Chaque matin nous nous levons ................ 7h30.",
        "options": [
          "à partir de",
          "jusqu’à",
          "à"
        ],
        "answer": "à",
        "wrongPenalty": -1
      },
      {
        "id": "q-056",
        "prompt": "Comment ............. à Marseille?",
        "options": [
          "aller",
          "allez",
          "allé"
        ],
        "answer": "aller",
        "wrongPenalty": -1
      },
      {
        "id": "q-057",
        "prompt": "C’est la raison pour …………… nous viendrons vous voir.",
        "options": [
          "lequel",
          "laquelle",
          "laquel"
        ],
        "answer": "laquelle",
        "wrongPenalty": -1
      },
      {
        "id": "q-058",
        "prompt": "Si j’avais été toi, je n’ ..........rien ........ .",
        "options": [
          "aurais rien fait",
          "avais rien fait",
          "ai rien fait"
        ],
        "answer": "aurais rien fait",
        "wrongPenalty": -1
      },
      {
        "id": "q-059",
        "prompt": "Je suis parti en voyage sans .................... mon billet.",
        "options": [
          "être réservé",
          "reserver",
          "avoir réservé"
        ],
        "answer": "avoir réservé",
        "wrongPenalty": -1
      },
      {
        "id": "q-060",
        "prompt": "Je ferai un tour du monde, quand je...................... au loto.",
        "options": [
          "gagnerai",
          "j’aurai gagné",
          "j’ai gagné"
        ],
        "answer": "j’aurai gagné",
        "wrongPenalty": -1
      }
    ]
  },
  "es-general": {
    "key": "es-general",
    "title": "İspanyolca Placement Test",
    "languageId": "es",
    "ageScope": "13+",
    "sourceFileName": "İspanyolca Seviye Tespiti.pdf",
    "placementBands": [
      {
        "min": 0,
        "max": 18,
        "label": "Libro 1"
      },
      {
        "min": 19,
        "max": 36,
        "label": "Libro 2"
      },
      {
        "min": 37,
        "max": 51,
        "label": "Libro 3"
      },
      {
        "min": 52,
        "max": 64,
        "label": "Libro 4"
      },
      {
        "min": 65,
        "max": 74,
        "label": "Libro 5"
      },
      {
        "min": 75,
        "max": 80,
        "label": "Libro 6"
      }
    ],
    "questions": [
      {
        "id": "q-001",
        "prompt": "Elton John es un famoso cantante y pianista británico.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-002",
        "prompt": "La mesa está en el techo.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-003",
        "prompt": "Estamos felizes cuando estamos enfermos.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-004",
        "prompt": "La madre de mi madre es mi abuela.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-005",
        "prompt": "Después del miércoles está el jueves.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-006",
        "prompt": "El puma es un animal doméstico.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-007",
        "prompt": "En el mercado venden carnes, frutas y verduras.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-008",
        "prompt": "En una ciudad grande hay mucho tráfico y atascos por la tarde.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-009",
        "prompt": "La comida mexicana no es picante.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-010",
        "prompt": "Comemos la carne con tenedor y cuchillo.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-011",
        "prompt": "Mi hermana es mayor que mi madre.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-012",
        "prompt": "Los taxistas conducen con los ojos cerrados.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-013",
        "prompt": "El limón tiene sabor ácido.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-014",
        "prompt": "Los turistas buscan información en la lavandería.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-015",
        "prompt": "En la papelería venden tijeras, calculadoras, papel y reglas.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-016",
        "prompt": "Compramos un jarabe para la tos en la farmacia.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-017",
        "prompt": "Antes de cruzar una calle hay que mirar a ambos lados.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-018",
        "prompt": "Apagamos la chimenea con una cerilla.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-019",
        "prompt": "El cigarrillo es nocivo para la salud.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-020",
        "prompt": "Un recién nacido camina rápido.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-021",
        "prompt": "En noviembre suben mucho las temperaturas en Europa.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-022",
        "prompt": "La plata es más cara que el oro.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-023",
        "prompt": "Alguien perfeccionista hace todo correctamente.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-024",
        "prompt": "Un jugador amateur gana satisfacción cuando gana un partido de fútbol.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-025",
        "prompt": "Estornudo cuando estoy un poco resfriado.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-026",
        "prompt": "Es natural que sientas frío en invierno.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-027",
        "prompt": "Los jóvenes consiguen empleos temporales en tiendas o restaurantes.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-028",
        "prompt": "El aire con mucho humo es bueno malo para los pulmones.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-029",
        "prompt": "Una persona educada nunca dice por favor, gracias, lo siento, perdón.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-030",
        "prompt": "Un intérprete traduce simultáneamente lo que alguien dice.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-031",
        "prompt": "El juez juzga a la gente culpable de delitos en los tribunales de justicia.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-032",
        "prompt": "Los sindicatos protestan la desigualdad de salarios con huelgas.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-033",
        "prompt": "Un pozo es curioso y muy valioso en el desierto.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-034",
        "prompt": "Es bueno tener muchas fallas en el examen.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-035",
        "prompt": "El Ártico está en el Polo Sur y el Antártico está en el Polo Norte.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-036",
        "prompt": "Si trabajara a paso de tortuga, me echarían de mi empleo.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-037",
        "prompt": "Los sordomudos se comunican a través del lenguaje de señas.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-038",
        "prompt": "Los astrónomos estudian el comportamiento de los planetas.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "verdadero",
        "wrongPenalty": -1
      },
      {
        "id": "q-039",
        "prompt": "Se puede fumar en clase.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-040",
        "prompt": "La gente amigable que siempre quiere echar una mano nos cae mal.",
        "options": [
          "verdadero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-041",
        "prompt": ".............. llamo Solomeo Paredes.",
        "options": [
          "Te",
          "Me",
          "Se"
        ],
        "answer": "Me",
        "wrongPenalty": 0
      },
      {
        "id": "q-042",
        "prompt": "Ella no .............. tonta y antipática.",
        "options": [
          "es",
          "soy",
          "eres"
        ],
        "answer": "es",
        "wrongPenalty": 0
      },
      {
        "id": "q-043",
        "prompt": "El estudiante .............. muchas amigas guapas.",
        "options": [
          "tiene",
          "tienen",
          "tengo"
        ],
        "answer": "tiene",
        "wrongPenalty": 0
      },
      {
        "id": "q-044",
        "prompt": "Mis hijos .............. la escuela a las nueve.",
        "options": [
          "empezan",
          "empiezo",
          "empiezan"
        ],
        "answer": "empiezan",
        "wrongPenalty": 0
      },
      {
        "id": "q-045",
        "prompt": "Yo .............. feliz cuando es mi cumpleaños.",
        "options": [
          "está",
          "estoy",
          "soy"
        ],
        "answer": "estoy",
        "wrongPenalty": 0
      },
      {
        "id": "q-046",
        "prompt": "En esta ciudad viven actrices ..............",
        "options": [
          "famosa",
          "famosas",
          "famoso"
        ],
        "answer": "famosas",
        "wrongPenalty": 0
      },
      {
        "id": "q-047",
        "prompt": "La gente inteligente .............. música clásica.",
        "options": [
          "termina",
          "pregunta",
          "escucha"
        ],
        "answer": "escucha",
        "wrongPenalty": 0
      },
      {
        "id": "q-048",
        "prompt": "¿Cuándo haces la compra? - .............. hago por la mañana.",
        "options": [
          "La",
          "Lo",
          "Las"
        ],
        "answer": "La",
        "wrongPenalty": 0
      },
      {
        "id": "q-049",
        "prompt": "No tengo .............. pantalones de pana.",
        "options": [
          "ninguna",
          "ningunas",
          "ningunos"
        ],
        "answer": "ningunos",
        "wrongPenalty": 0
      },
      {
        "id": "q-050",
        "prompt": "A mi mujer .............. doy flores todos los días.",
        "options": [
          "le",
          "la",
          "lo"
        ],
        "answer": "le",
        "wrongPenalty": 0
      },
      {
        "id": "q-051",
        "prompt": "El sábado vamos a .............. la compra en el supermercado.",
        "options": [
          "hacer",
          "hacemos",
          "hagamos"
        ],
        "answer": "hacer",
        "wrongPenalty": 0
      },
      {
        "id": "q-052",
        "prompt": "Mi hija llora .............. no tener que ponerse.",
        "options": [
          "que",
          "por",
          "para"
        ],
        "answer": "por",
        "wrongPenalty": 0
      },
      {
        "id": "q-053",
        "prompt": "Mis compañeros de clase están .............. español conmigo.",
        "options": [
          "estudian",
          "estudiado",
          "estudiando"
        ],
        "answer": "estudiando",
        "wrongPenalty": 0
      },
      {
        "id": "q-054",
        "prompt": "Los alumnos .............. que estudiar en casa.",
        "options": [
          "tienen",
          "deben",
          "van"
        ],
        "answer": "tienen",
        "wrongPenalty": 0
      },
      {
        "id": "q-055",
        "prompt": "El año pasado ella .............. en el extranjero.",
        "options": [
          "ha vivido",
          "vive",
          "vivió"
        ],
        "answer": "vivió",
        "wrongPenalty": 0
      },
      {
        "id": "q-056",
        "prompt": "Ayer la clase .............. interesante y divertida.",
        "options": [
          "fue",
          "es",
          "ha estado"
        ],
        "answer": "fue",
        "wrongPenalty": 0
      },
      {
        "id": "q-057",
        "prompt": "Mi madre ha .............. pescado al horno.",
        "options": [
          "hacido",
          "hecho",
          "hace"
        ],
        "answer": "hecho",
        "wrongPenalty": 0
      },
      {
        "id": "q-058",
        "prompt": "Nikola Tesla .............. el mando a distancia.",
        "options": [
          "inventaba",
          "inventó",
          "estaba inventando"
        ],
        "answer": "inventó",
        "wrongPenalty": 0
      },
      {
        "id": "q-059",
        "prompt": "A las alumnas de mi colegio no les .............. la educación física.",
        "options": [
          "gustaba",
          "gustaban",
          "gustan"
        ],
        "answer": "gustaba",
        "wrongPenalty": 0
      },
      {
        "id": "q-060",
        "prompt": "Si vais a las montañas, .............. un chalé.",
        "options": [
          "alquilen",
          "alquila",
          "alquilad"
        ],
        "answer": "alquilad",
        "wrongPenalty": 0
      },
      {
        "id": "q-061",
        "prompt": "Mi marido se mantiene en forma .............. ejercicio.",
        "options": [
          "hace",
          "hecho",
          "haciendo"
        ],
        "answer": "haciendo",
        "wrongPenalty": 0
      },
      {
        "id": "q-062",
        "prompt": "En esta ciudad antes .............. mucho coches y bicicletas.",
        "options": [
          "roban",
          "robaban",
          "robaron"
        ],
        "answer": "robaban",
        "wrongPenalty": 0
      },
      {
        "id": "q-063",
        "prompt": "Quiero que ojalá ............. pronto más políticos honestos.",
        "options": [
          "haya",
          "hay",
          "son"
        ],
        "answer": "haya",
        "wrongPenalty": 0
      },
      {
        "id": "q-064",
        "prompt": "Las próximas vacaciones .............. a Uruguay.",
        "options": [
          "vamos",
          "iremos",
          "fuimos"
        ],
        "answer": "iremos",
        "wrongPenalty": 0
      },
      {
        "id": "q-065",
        "prompt": "Es horrible que la gente .............. que todo es imposible.",
        "options": [
          "piensa",
          "piense",
          "pensar"
        ],
        "answer": "piense",
        "wrongPenalty": 0
      },
      {
        "id": "q-066",
        "prompt": "El profesor dice: ¡No .............. otro idioma en clase!",
        "options": [
          "habléis",
          "hablad",
          "hablar"
        ],
        "answer": "habléis",
        "wrongPenalty": 0
      },
      {
        "id": "q-067",
        "prompt": "El uso excesivo de químicos está .............. el ecosistema acuático del planeta.",
        "options": [
          "destruido",
          "destruyendo",
          "destruir"
        ],
        "answer": "destruyendo",
        "wrongPenalty": 0
      },
      {
        "id": "q-068",
        "prompt": "La libertad de prensa .............. apoyada por todos aquí.",
        "options": [
          "eres",
          "se",
          "es"
        ],
        "answer": "es",
        "wrongPenalty": 0
      },
      {
        "id": "q-069",
        "prompt": "El mar Báltico está muy .............. por el uso excesivo de químicos.",
        "options": [
          "contaminado",
          "contaminando",
          "contamina"
        ],
        "answer": "contaminado",
        "wrongPenalty": 0
      },
      {
        "id": "q-070",
        "prompt": "Ellos dijeron que .............. a educarles con paciencia y amor.",
        "options": [
          "iban",
          "iba",
          "fueran"
        ],
        "answer": "iban",
        "wrongPenalty": 0
      },
      {
        "id": "q-071",
        "prompt": "La profesora le preguntó que dónde .............. a su marido.",
        "options": [
          "ha conocido",
          "había conocido",
          "conocido"
        ],
        "answer": "había conocido",
        "wrongPenalty": 0
      },
      {
        "id": "q-072",
        "prompt": "Si mis hijos se pusieran enfermos, les .............. al médico.",
        "options": [
          "he llevado",
          "llevo",
          "llevaría"
        ],
        "answer": "llevaría",
        "wrongPenalty": 0
      },
      {
        "id": "q-073",
        "prompt": "Siempre queremos que .............. pronto las vacaciones.",
        "options": [
          "empiezan",
          "empiecen",
          "empezaron"
        ],
        "answer": "empiecen",
        "wrongPenalty": 0
      },
      {
        "id": "q-074",
        "prompt": "La disminución del hielo en los polos es .............. la contaminación.",
        "options": [
          "para",
          "sino",
          "por"
        ],
        "answer": "por",
        "wrongPenalty": 0
      },
      {
        "id": "q-075",
        "prompt": "Quise saber el .............. de la vida desde que tenía siete años.",
        "options": [
          "por que",
          "porqué",
          "porque"
        ],
        "answer": "porqué",
        "wrongPenalty": 0
      },
      {
        "id": "q-076",
        "prompt": "Creo que ............... a menudo, seremos más accesibles y amigables a los demás.",
        "options": [
          "sonriendo",
          "sonreir",
          "sonreído"
        ],
        "answer": "sonriendo",
        "wrongPenalty": 0
      },
      {
        "id": "q-077",
        "prompt": "............... tenga problemas, siempre sonrío.",
        "options": [
          "Para",
          "Ante",
          "Aunque"
        ],
        "answer": "Aunque",
        "wrongPenalty": 0
      },
      {
        "id": "q-078",
        "prompt": "............... mucho más fácil si nos adaptáramos a vivir juntos y en paz.",
        "options": [
          "Sería",
          "Fue",
          "Es"
        ],
        "answer": "Sería",
        "wrongPenalty": 0
      },
      {
        "id": "q-079",
        "prompt": "Ayer cuando llegué a la escuela la clase todavía no ...............",
        "options": [
          "hubiera empezado",
          "ha empezado",
          "había empezado"
        ],
        "answer": "había empezado",
        "wrongPenalty": 0
      },
      {
        "id": "q-080",
        "prompt": "Por favor no .............. tarde hoy a casa ¿Vale?",
        "options": [
          "vienes",
          "vengas",
          "venir"
        ],
        "answer": "vengas",
        "wrongPenalty": 0
      }
    ]
  },
  "it-general": {
    "key": "it-general",
    "title": "İtalyanca Placement Test",
    "languageId": "it",
    "ageScope": "13+",
    "sourceFileName": "İtalyanca Seviye Tespiti.pdf",
    "placementBands": [
      {
        "min": 0,
        "max": 16,
        "label": "Libro 1"
      },
      {
        "min": 17,
        "max": 36,
        "label": "Libro 2"
      },
      {
        "min": 37,
        "max": 55,
        "label": "Libro 3"
      },
      {
        "min": 56,
        "max": 60,
        "label": "Libro 4"
      }
    ],
    "questions": [
      {
        "id": "q-001",
        "prompt": "Gli statunitensi vengono dagli Stati Uniti.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-002",
        "prompt": "I bambini bevono il caffè per la colazione.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-003",
        "prompt": "L’acqua bolle a cento gradi.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-004",
        "prompt": "Le melanzane sono viola.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-005",
        "prompt": "Il pettine serve per fare una pettinatura.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-006",
        "prompt": "A maggio nevica.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-007",
        "prompt": "Di mattina gli uomini fanno la barba e fanno la doccia.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-008",
        "prompt": "Ogni cittadino ha il diritto di votare durante gli elezioni.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-009",
        "prompt": "Di solito Pasqua festeggiamo a dicembre.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-010",
        "prompt": "Il cane abita nella cuccia.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-011",
        "prompt": "Sul deserto vivono i cani.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-012",
        "prompt": "Il primo giorno della settimana è sabato.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-013",
        "prompt": "La gente povera vive in Europa.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-014",
        "prompt": "Di solito la gente aiuta alle fondazioni.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-015",
        "prompt": "Il giardiniere lavora in banca.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-016",
        "prompt": "La casalinga è una donna che lavora in ufficio.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-017",
        "prompt": "Quattro è prima di tre.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-018",
        "prompt": "L’anello d’oro è costoso.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-019",
        "prompt": "I bambini non nascono mai negli ospedali.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-020",
        "prompt": "Marzo è tra luglio e aprile.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-021",
        "prompt": "Le forbici servono per tagliare.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-022",
        "prompt": "A luglio fa caldo.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-023",
        "prompt": "Il 60° anniversario del matrimonio si chiama diamante.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-024",
        "prompt": "La persona onesta non fa delle cose buone.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-025",
        "prompt": "La tazza si usa per bere il vino.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-026",
        "prompt": "I cinesi vivono in Cina.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-027",
        "prompt": "Il Babbo Natale non dà i regali agli bambini buoni.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-028",
        "prompt": "Il coniglio non vive in Europa.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "falso",
        "wrongPenalty": -1
      },
      {
        "id": "q-029",
        "prompt": "In Africa la gente muoie dal fame.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-030",
        "prompt": ". Sabato è tra venerdì e domenica.",
        "options": [
          "vero",
          "falso"
        ],
        "answer": "vero",
        "wrongPenalty": -1
      },
      {
        "id": "q-031",
        "prompt": "Andiamo al cinema con le _________.",
        "options": [
          "colleghe",
          "college",
          "collega"
        ],
        "answer": "colleghe",
        "wrongPenalty": 0
      },
      {
        "id": "q-032",
        "prompt": "La nonna _________ tutto il giorno.",
        "options": [
          "ha dormita",
          "è dormito",
          "ha dormito"
        ],
        "answer": "ha dormito",
        "wrongPenalty": 0
      },
      {
        "id": "q-033",
        "prompt": "Pietro _________ dicianove anni.",
        "options": [
          "ho",
          "hai",
          "ha"
        ],
        "answer": "ha",
        "wrongPenalty": 0
      },
      {
        "id": "q-034",
        "prompt": "Guardano le fotografie? – Si, _________ guardano.",
        "options": [
          "la",
          "le",
          "li"
        ],
        "answer": "le",
        "wrongPenalty": 0
      },
      {
        "id": "q-035",
        "prompt": "Le scarpe nuove mi _________ molto eleganti.",
        "options": [
          "paio",
          "sono",
          "paiono"
        ],
        "answer": "paiono",
        "wrongPenalty": 0
      },
      {
        "id": "q-036",
        "prompt": "Ridiamo _________ barzellette di Claudio.",
        "options": [
          "per",
          "delle",
          "nelle"
        ],
        "answer": "delle",
        "wrongPenalty": 0
      },
      {
        "id": "q-037",
        "prompt": "A luglio siete in Francia? Si, _________ siamo a luglio.",
        "options": [
          "la",
          "ci",
          "ne"
        ],
        "answer": "ci",
        "wrongPenalty": 0
      },
      {
        "id": "q-038",
        "prompt": "Giovanni non pensa _________ Maria.",
        "options": [
          "a",
          "ci",
          "ne"
        ],
        "answer": "a",
        "wrongPenalty": 0
      },
      {
        "id": "q-039",
        "prompt": "I capelli _________ lisci e marroni.",
        "options": [
          "sono",
          "hanno",
          "hai"
        ],
        "answer": "sono",
        "wrongPenalty": 0
      },
      {
        "id": "q-040",
        "prompt": "Torniamo _________ Italia il mese prossimo.",
        "options": [
          "all’",
          "dall’",
          "dell’"
        ],
        "answer": "dall’",
        "wrongPenalty": 0
      },
      {
        "id": "q-041",
        "prompt": "Io _________ andato all’estero l’anno scorso.",
        "options": [
          "ho",
          "hai",
          "sono"
        ],
        "answer": "sono",
        "wrongPenalty": 0
      },
      {
        "id": "q-042",
        "prompt": "Gli studenti _________ il professore.",
        "options": [
          "ascoltano",
          "acoltono",
          "ascoltiano"
        ],
        "answer": "ascoltano",
        "wrongPenalty": 0
      },
      {
        "id": "q-043",
        "prompt": "Oggi noi _________ la spesa.",
        "options": [
          "fate",
          "faciamo",
          "siamo"
        ],
        "answer": "faciamo",
        "wrongPenalty": 0
      },
      {
        "id": "q-044",
        "prompt": "L’insegnante _________ informazioni agli studenti.",
        "options": [
          "è",
          "dai",
          "dà"
        ],
        "answer": "dà",
        "wrongPenalty": 0
      },
      {
        "id": "q-045",
        "prompt": "La lingua sueca _________ facile.",
        "options": [
          "fa",
          "è",
          "ha"
        ],
        "answer": "è",
        "wrongPenalty": 0
      },
      {
        "id": "q-046",
        "prompt": "Le loro figlie sono _________.",
        "options": [
          "stanci",
          "stanche",
          "stanchi"
        ],
        "answer": "stanche",
        "wrongPenalty": 0
      },
      {
        "id": "q-047",
        "prompt": "Il mio amico è _________ al lavoro due ore fa.",
        "options": [
          "corso",
          "corrare",
          "corrso"
        ],
        "answer": "corso",
        "wrongPenalty": 0
      },
      {
        "id": "q-048",
        "prompt": "I pomodori _________ rossi.",
        "options": [
          "hanno",
          "sono",
          "è"
        ],
        "answer": "sono",
        "wrongPenalty": 0
      },
      {
        "id": "q-049",
        "prompt": "Hai incontrato Tessa? Si, _________.",
        "options": [
          "l’ho incontrata",
          "la ho incontrato",
          "la ho incontrata"
        ],
        "answer": "l’ho incontrata",
        "wrongPenalty": 0
      },
      {
        "id": "q-050",
        "prompt": "Mangiamo _________ spaghetti.",
        "options": [
          "la",
          "le",
          "glli"
        ],
        "answer": "la",
        "wrongPenalty": 0
      },
      {
        "id": "q-051",
        "prompt": "Domani (io) _________ con la mia amica in biblioteca.",
        "options": [
          "studierai",
          "studierò",
          "studierà"
        ],
        "answer": "studierò",
        "wrongPenalty": 0
      },
      {
        "id": "q-052",
        "prompt": "La tigre _________ in Asia.",
        "options": [
          "vivi",
          "viva",
          "vive"
        ],
        "answer": "vive",
        "wrongPenalty": 0
      },
      {
        "id": "q-053",
        "prompt": "Gli italiani _________ spesso il vino.",
        "options": [
          "bevono",
          "bevete",
          "berono"
        ],
        "answer": "bevono",
        "wrongPenalty": 0
      },
      {
        "id": "q-054",
        "prompt": "Il professore dice agli studenti : _________ buon educati!",
        "options": [
          "sono",
          "sii",
          "siano"
        ],
        "answer": "siano",
        "wrongPenalty": 0
      },
      {
        "id": "q-055",
        "prompt": "Quando _________ all’ università _________ in un monolocale.",
        "options": [
          "studiate / abitavo",
          "studiavo / abitavo",
          "studiavo / ha abitato"
        ],
        "answer": "studiavo / abitavo",
        "wrongPenalty": 0
      },
      {
        "id": "q-056",
        "prompt": "I turisti _________ per due settimane",
        "options": [
          "rimangono",
          "rimangano",
          "rimanano"
        ],
        "answer": "rimangono",
        "wrongPenalty": 0
      },
      {
        "id": "q-057",
        "prompt": "Quanti film avete visto? – _________.",
        "options": [
          "Ci abbiamo visto due",
          "Ne abbiamo visti due",
          "Ne abbiamo visto due"
        ],
        "answer": "Ne abbiamo visti due",
        "wrongPenalty": 0
      },
      {
        "id": "q-058",
        "prompt": "Il gatto _________ in cucina.",
        "options": [
          "dormi",
          "dorma",
          "dorme"
        ],
        "answer": "dorme",
        "wrongPenalty": 0
      },
      {
        "id": "q-059",
        "prompt": "Gli studenti _________ un libro.",
        "options": [
          "hanno letto",
          "hanno letti",
          "hanno legguto"
        ],
        "answer": "hanno letto",
        "wrongPenalty": 0
      },
      {
        "id": "q-060",
        "prompt": "Io _________ volentieri a casa tua domani sera.",
        "options": [
          "veno",
          "viene",
          "vengo"
        ],
        "answer": "vengo",
        "wrongPenalty": 0
      }
    ]
  },
  "ru-general": {
    "key": "ru-general",
    "title": "Rusça Placement Test",
    "languageId": "ru",
    "ageScope": "13+",
    "sourceFileName": "Rusça Seviye Tespit.pdf",
    "placementBands": [
      {
        "min": 0,
        "max": 20,
        "label": "КНИГА 1",
        "cefr": "A1"
      },
      {
        "min": 21,
        "max": 40,
        "label": "КНИГА 2"
      },
      {
        "min": 41,
        "max": 60,
        "label": "КНИГА 3",
        "cefr": "A2"
      },
      {
        "min": 61,
        "max": 80,
        "label": "КНИГА 4",
        "cefr": "B1"
      }
    ],
    "questions": [
      {
        "id": "q-001",
        "prompt": "Утром мы завтракаем.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-002",
        "prompt": "Зимой деревья жёлтые,",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-003",
        "prompt": "В ванной часто есть диван.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-004",
        "prompt": "Сентябрь – девятый месяц.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-005",
        "prompt": "Клубника и малина – красные ягоды.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-006",
        "prompt": "Врачи работают в больнице.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-007",
        "prompt": "Летом ночи короткие.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-008",
        "prompt": "Ты не умеешь читать на русском языке.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-009",
        "prompt": "Когда на улице жарко, люди носят тёплую одежду.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-010",
        "prompt": "Сначала мы просыпаемся, а потом встаём.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-011",
        "prompt": "В номерах гостиниц обычно есть мыло и полотенце.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-012",
        "prompt": "Мясо едят ножом и вилкой.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-013",
        "prompt": "Блины можно сделать без яиц и муки.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-014",
        "prompt": "Овощные соки полезные.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-015",
        "prompt": "Высоким мужчинам неудобно ездить в маленьких машинах.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-016",
        "prompt": "У богатых людей много денег.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-017",
        "prompt": "На день рождения маленькие дети могут получить игрушку в подарок.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-018",
        "prompt": "Всем людям нравятся путешествия.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-019",
        "prompt": "В поездах нельзя сидеть около окна.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-020",
        "prompt": "Родители гордятся успехами своих детей.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-021",
        "prompt": "Взрослым нужно спать больше, чем детям.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-022",
        "prompt": "Люди худеют, когда они слишком мало едят.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-023",
        "prompt": "У итальянцев более загорелая кожа, чем у шведов.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-024",
        "prompt": "Белки такие же опасные животные, как акулы.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-025",
        "prompt": "Осенью больше туманных дней, чем летом.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-026",
        "prompt": "Много людей встаёт на работу по будильнику.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-027",
        "prompt": "Никто не любит острую пищу.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-028",
        "prompt": "Если не держать молоко в холодильнике, оно быстрее прокиснет.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-029",
        "prompt": "Опытные работники получают более низкую зарплату.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-030",
        "prompt": "Художник не нарисует картину, если ему не на чем её рисовать.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-031",
        "prompt": "«Двоюродный брат» – это то же самое, что «мамин брат».",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-032",
        "prompt": "Все родственники любят общаться друг с другом.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-033",
        "prompt": "Ребёнка трёхлетнего возраста можно оставлять одного дома.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-034",
        "prompt": "Поджаренное позавчера мясо безопасно будет употреблять через шесть дней.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-035",
        "prompt": "Живущим в сельской местности людям нельзя выращивать тюльпаны.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-036",
        "prompt": "При простуде у больного часто высокая температура.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-037",
        "prompt": "Если человек отравился, у него может идти кровь из пальца.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-038",
        "prompt": "Курение и употребление спиртных напитков полезно для нашего здоровья.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-039",
        "prompt": "Футбольная команда может состоять из тридцати игроков.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "Н",
        "wrongPenalty": -1
      },
      {
        "id": "q-040",
        "prompt": "Награду получает победивший в соревновании спортсмен.",
        "options": [
          "В",
          "Н"
        ],
        "answer": "В",
        "wrongPenalty": -1
      },
      {
        "id": "q-041",
        "prompt": "Как _____ зовут? – Анна.",
        "options": [
          "его",
          "её",
          "их"
        ],
        "answer": "её",
        "wrongPenalty": -1
      },
      {
        "id": "q-042",
        "prompt": "_____ это тетрадь?",
        "options": [
          "Чья",
          "Чей",
          "Чьё"
        ],
        "answer": "Чья",
        "wrongPenalty": -1
      },
      {
        "id": "q-043",
        "prompt": "Это моя сестра. А вот _____ родители.",
        "options": [
          "ваше",
          "наши",
          "их"
        ],
        "answer": "наши",
        "wrongPenalty": -1
      },
      {
        "id": "q-044",
        "prompt": "Мы любим гулять в _____.",
        "options": [
          "парку",
          "парки",
          "парке"
        ],
        "answer": "парке",
        "wrongPenalty": -1
      },
      {
        "id": "q-045",
        "prompt": "Мои друзья _____ в этом офисе.",
        "options": [
          "работает",
          "работаем",
          "работают"
        ],
        "answer": "работают",
        "wrongPenalty": -1
      },
      {
        "id": "q-046",
        "prompt": "Я не люблю смотреть _____ фильмы.",
        "options": [
          "скучный",
          "скучные",
          "скучное"
        ],
        "answer": "скучные",
        "wrongPenalty": -1
      },
      {
        "id": "q-047",
        "prompt": "_____ часов ты работаешь?",
        "options": [
          "сколько",
          "когда",
          "где"
        ],
        "answer": "сколько",
        "wrongPenalty": -1
      },
      {
        "id": "q-048",
        "prompt": "Учитель говорит о _____ предложении.",
        "options": [
          "длинные",
          "длинных",
          "длинном"
        ],
        "answer": "длинном",
        "wrongPenalty": -1
      },
      {
        "id": "q-049",
        "prompt": "Машины стоят на _____.",
        "options": [
          "улицах",
          "улица",
          "улицу"
        ],
        "answer": "улицах",
        "wrongPenalty": -1
      },
      {
        "id": "q-050",
        "prompt": "Ты часто слушаешь _____?",
        "options": [
          "тихая музыка",
          "тихую музыку",
          "тихой музыки"
        ],
        "answer": "тихую музыку",
        "wrongPenalty": -1
      },
      {
        "id": "q-051",
        "prompt": "Вчера мы были _____.",
        "options": [
          "домом",
          "дома",
          "домой"
        ],
        "answer": "дома",
        "wrongPenalty": -1
      },
      {
        "id": "q-052",
        "prompt": "У нас было много времени, _____ мы пошли пешком.",
        "options": [
          "поэтому",
          "потому что",
          "зачем"
        ],
        "answer": "поэтому",
        "wrongPenalty": -1
      },
      {
        "id": "q-053",
        "prompt": "Нам нужны будут пять _____.",
        "options": [
          "тарелки",
          "тарелок",
          "тарелков"
        ],
        "answer": "тарелок",
        "wrongPenalty": -1
      },
      {
        "id": "q-054",
        "prompt": "В нашей библиотеке нет _____.",
        "options": [
          "интересной книга",
          "интересные книги",
          "интересных книг"
        ],
        "answer": "интересных книг",
        "wrongPenalty": -1
      },
      {
        "id": "q-055",
        "prompt": "_____ он вернулся? – Из Москвы.",
        "options": [
          "Куда",
          "Где",
          "Откуда"
        ],
        "answer": "Откуда",
        "wrongPenalty": -1
      },
      {
        "id": "q-056",
        "prompt": "Продавец показывает товар _____.",
        "options": [
          "клиентом",
          "клиенте",
          "клиенту"
        ],
        "answer": "клиенту",
        "wrongPenalty": -1
      },
      {
        "id": "q-057",
        "prompt": "Завтра _____ надо будет забронировать номер в гостинице.",
        "options": [
          "мою сестру",
          "моей сестры",
          "моей сестре"
        ],
        "answer": "моей сестре",
        "wrongPenalty": -1
      },
      {
        "id": "q-058",
        "prompt": "Когда я был ребёнком, я хотел стать _____.",
        "options": [
          "строителем",
          "строителей",
          "строителям"
        ],
        "answer": "строителем",
        "wrongPenalty": -1
      },
      {
        "id": "q-059",
        "prompt": "Я _____ вас завтра на вокзале.",
        "options": [
          "встречаю",
          "встречал",
          "встречу"
        ],
        "answer": "встречу",
        "wrongPenalty": -1
      },
      {
        "id": "q-060",
        "prompt": "Когда будешь выходить, _____ свет, пожалуйста.",
        "options": [
          "выключи",
          "выключат",
          "выключайте"
        ],
        "answer": "выключи",
        "wrongPenalty": -1
      },
      {
        "id": "q-061",
        "prompt": "Я знаю _____ человека, чем он.",
        "options": [
          "привлекательного",
          "более привлекательного",
          "привлекательнее"
        ],
        "answer": "более привлекательного",
        "wrongPenalty": -1
      },
      {
        "id": "q-062",
        "prompt": "Мы _____ жили около моря.",
        "options": [
          "когда-нибудь",
          "когда-либо",
          "когда-то"
        ],
        "answer": "когда-то",
        "wrongPenalty": -1
      },
      {
        "id": "q-063",
        "prompt": "Всех учеников в следующую пятницу _____ в зоопарк.",
        "options": [
          "ведут",
          "водят",
          "вытрут"
        ],
        "answer": "ведут",
        "wrongPenalty": -1
      },
      {
        "id": "q-064",
        "prompt": "Ты умеешь _____ суп?",
        "options": [
          "печь",
          "варить",
          "жарить"
        ],
        "answer": "варить",
        "wrongPenalty": -1
      },
      {
        "id": "q-065",
        "prompt": "Сегодня на уроке нет _____ учениц.",
        "options": [
          "четыре",
          "четырём",
          "четырёх"
        ],
        "answer": "четырёх",
        "wrongPenalty": -1
      },
      {
        "id": "q-066",
        "prompt": "Из последней командировки папа _____ нам много подарков.",
        "options": [
          "привёз",
          "принёс",
          "привёл"
        ],
        "answer": "привёз",
        "wrongPenalty": -1
      },
      {
        "id": "q-067",
        "prompt": "13.40 – это.",
        "options": [
          "двадцать минут второго",
          "без двадцати два",
          "без двадцати час"
        ],
        "answer": "без двадцати два",
        "wrongPenalty": -1
      },
      {
        "id": "q-068",
        "prompt": "_____ вы сядете за стол ужинать, помойте руки.",
        "options": [
          "перед тем как",
          "после того как",
          "с тех пор как"
        ],
        "answer": "перед тем как",
        "wrongPenalty": -1
      },
      {
        "id": "q-069",
        "prompt": "Если хочешь поиграть в футбол, _____ спортивный костюм.",
        "options": [
          "одень",
          "раздень",
          "надень"
        ],
        "answer": "надень",
        "wrongPenalty": -1
      },
      {
        "id": "q-070",
        "prompt": "В этом году бытовая техника подорожала _____ два раза.",
        "options": [
          "в",
          "на",
          "о"
        ],
        "answer": "в",
        "wrongPenalty": -1
      },
      {
        "id": "q-071",
        "prompt": "У меня нет даже _____ рублей в кошельке.",
        "options": [
          "пятьдесят",
          "пятьюдесятью",
          "пятидесяти"
        ],
        "answer": "пятидесяти",
        "wrongPenalty": -1
      },
      {
        "id": "q-072",
        "prompt": "Человека после сорока можно назвать _____.",
        "options": [
          "зрелым",
          "юным",
          "подростком"
        ],
        "answer": "зрелым",
        "wrongPenalty": -1
      },
      {
        "id": "q-073",
        "prompt": "В нашем зоопарке родились три маленьких _____.",
        "options": [
          "слонята",
          "слонёнки",
          "слонёнка"
        ],
        "answer": "слонёнка",
        "wrongPenalty": -1
      },
      {
        "id": "q-074",
        "prompt": "Мы подходим к _____ в девятнадцатом веке кирпичному дому.",
        "options": [
          "строящемуся",
          "построившем",
          "построенному"
        ],
        "answer": "построенному",
        "wrongPenalty": -1
      },
      {
        "id": "q-075",
        "prompt": "Доктор спросил меня, _____ какие-нибудь витамины.",
        "options": [
          "принимаю ли я",
          "я принимаю",
          "или я принимаю"
        ],
        "answer": "принимаю ли я",
        "wrongPenalty": -1
      },
      {
        "id": "q-076",
        "prompt": "Преподаватель записывал все в маленькой _____.",
        "options": [
          "дочке",
          "ночке",
          "тетрадочке"
        ],
        "answer": "тетрадочке",
        "wrongPenalty": -1
      },
      {
        "id": "q-077",
        "prompt": "В поезде сидело _____ мужчин.",
        "options": [
          "трое",
          "три",
          "трёх"
        ],
        "answer": "трое",
        "wrongPenalty": -1
      },
      {
        "id": "q-078",
        "prompt": "_____ болельщика встали, когда вошёл судья.",
        "options": [
          "обе",
          "оба",
          "вдвоём"
        ],
        "answer": "оба",
        "wrongPenalty": -1
      },
      {
        "id": "q-079",
        "prompt": "Когда они увидели своего сына, они заплакали _____ счастья.",
        "options": [
          "из-за",
          "с",
          "от"
        ],
        "answer": "от",
        "wrongPenalty": -1
      },
      {
        "id": "q-080",
        "prompt": "_____ они и ругаются часто, они любят друг друга.",
        "options": [
          "хотя",
          "хотя бы",
          "хотел бы"
        ],
        "answer": "хотя",
        "wrongPenalty": -1
      }
    ]
  }
} as const satisfies Partial<Record<PlacementExamKey, PlacementExamBank>>;
