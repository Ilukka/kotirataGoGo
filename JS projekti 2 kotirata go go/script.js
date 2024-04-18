//Kuuntelijan lisääminen ja asemanValinta funktion käynnistys sen avulla 
document.getElementById("asemat").addEventListener("change", asemanValinta);
document.addEventListener("DOMContentLoaded", asemanValinta);

//Funktio, joka hakee tiedot valitun aseman mukaan rajapinnasta
function asemanValinta() {
  var valinta = document.getElementById("asemat");
  var asema = valinta.value;
  var url = "https://rata.digitraffic.fi/api/v1/live-trains/station/" + asema + "?departing_trains=100&include_nonstopping=false&train_categories=Commuter";

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Verkko ei vastannut oikein');
      }
      return response.json();
    })
    .then(jsonObjekti => {
      näytäJunienTiedot(jsonObjekti, asema);
    })
    .catch(error => {
      console.error('Tietojen haussa ongelma:', error);
    });
}

//Funktio, joka valitsee ja näyttää tiedot
function näytäJunienTiedot(jsonObjekti, asema) {
  var lähtöajat = [];
  var nyt = new Date();

  //Näytetään valitun aseman lähtevien junien tiedot 
  jsonObjekti.forEach(tiedot => {
    tiedot.timeTableRows.forEach(aikatauluRivit => {
      if (aikatauluRivit.stationShortCode === asema && aikatauluRivit.type === "DEPARTURE" && ["K", "I", "P"].includes(tiedot.commuterLineID)) {
        var viimeinenObjekti = tiedot.timeTableRows[tiedot.timeTableRows.length - 1];
        var pääteAsema = viimeinenObjekti.stationShortCode;

        //Muutetaan pääteaseman lyhenne 
        switch (pääteAsema) {
          case "HKI":
            pääteAsema = (tiedot.commuterLineID === "I") ? "Lentoasema" : "Helsinki";
            break;
          case "KE":
            pääteAsema = "Kerava";
            break;
          case "LEN":
            pääteAsema = "Lentokenttä";
            break;
        }
        //Haetaan junien lähtöajat
        var aika = new Date(aikatauluRivit.scheduledTime);

        //Valitaan kaikista päivän junista näytettäväksi vain tulevat junat
        if (aika >= nyt) {
          lähtöajat.push({
            juna: tiedot.commuterLineID,
            raide: aikatauluRivit.commercialTrack,
            mihin: pääteAsema,
            aika: aika.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aikaleima: aika
          });
        }
      }
    });
  });

        //lajitellaan junat aikaleiman mukaan
        lähtöajat.sort((a, b) => a.aikaleima - b.aikaleima);

        //Luodaan taulukko, johon tiedot viedään. Näytetään 10 seuraavaa lähtöä.
        var tiedot = "<table> <tr> <th> Juna </th> <th> Raide </th> <th> Lähtöaika </th> <th> Mihin </th></tr>";
        for (var k = 0; k < Math.min(lähtöajat.length, 10); k++) {
        var lähtö = lähtöajat[k];

            tiedot += '<tr>';
            tiedot += '<td>' + lähtö.juna + '</td>';
            tiedot += '<td>' + lähtö.raide + '</td>';
            tiedot += '<td>' + lähtö.aika + '</td>';
            tiedot += '<td>' + lähtö.mihin + '</td>';
            tiedot += '</tr>';
    }

            tiedot += "</table>";
        
        document.getElementById("tiedot").innerHTML = tiedot;
}
