const map = L.map('map').setView([-7.975, 112.633], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 10
}).addTo(map);

// Daftar distrik dengan koordinat dan URL API
const districts = [
    { name: 'Klojen', coords: [-7.982, 112.630], apiUrl: "https://api.open-meteo.com/v1/forecast?latitude=-7.982&longitude=112.630&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=temperature_2m,precipitation&timezone=Asia%2FBangkok&forecast_days=3" },
    { name: "Blimbing", coords: [-7.939, 112.647], apiUrl: "https://api.open-meteo.com/v1/forecast?latitude=-7.939&longitude=112.647&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=temperature_2m,precipitation&timezone=Asia%2FBangkok&forecast_days=3" },
    { name: "Lowokwaru", coords: [-7.952, 112.611], apiUrl: "https://api.open-meteo.com/v1/forecast?latitude=-7.952&longitude=112.611&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=temperature_2m,precipitation&timezone=Asia%2FBangkok&forecast_days=3" },
    { name: "Sukun", coords: [-8.003, 112.614], apiUrl: "https://api.open-meteo.com/v1/forecast?latitude=-8.003&longitude=112.614&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=temperature_2m,precipitation&timezone=Asia%2FBangkok&forecast_days=3" },
    { name: "Kedungkandang", coords: [-7.978, 112.664], apiUrl: "https://api.open-meteo.com/v1/forecast?latitude=-7.978&longitude=112.664&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&current=temperature_2m,precipitation&timezone=Asia%2FBangkok&forecast_days=3" }
];

// Fungsi untuk mengambil data cuaca dari API
function fetchWeatherData(apiUrl) {
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Pastikan properti yang dibutuhkan ada
            if (
                data &&
                data.current &&
                data.daily &&
                data.daily.temperature_2m_max &&
                data.daily.temperature_2m_min
            ) {
                const dailyData = data.daily;
                const currentData = data.current;
                return {
                    maxTemp: dailyData.temperature_2m_max[0],
                    minTemp: dailyData.temperature_2m_min[0],
                    currentTemp: currentData.temperature_2m,
                    precipitationSum: currentData.precipitation
                };
            } else {
                console.error(`Data cuaca tidak lengkap dari API: ${apiUrl}`);
                return null;
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            return null;
        });
}

// Mengambil data cuaca untuk semua distrik saat halaman dimuat
Promise.all(districts.map(district => {
    return fetchWeatherData(district.apiUrl).then(weatherData => {
        if (weatherData) {
            district.maxTemp = weatherData.maxTemp;
            district.minTemp = weatherData.minTemp;
            district.currentTemp = weatherData.currentTemp;
            district.precipitationSum = weatherData.precipitationSum;
        }
    });
})).then(() => {
    // Setelah semua data cuaca didapatkan, tambahkan marker ke peta
    districts.forEach(district => {
        if (
            district.currentTemp !== undefined &&
            district.precipitationSum !== undefined
        ) {
            const marker = L.marker(district.coords).addTo(map)
                .bindTooltip(`<b>${district.name}</b><br>Current Temp: ${district.currentTemp}°C<br>Precipitation: ${district.precipitationSum} mm`)
                .on('click', function () {
                    fetchWeatherForecast(district.apiUrl);
                });
        } else {
            console.error(`Data cuaca tidak lengkap untuk ${district.name}`);
        }
    });
});

// Fungsi untuk menampilkan prakiraan cuaca 3 hari kedepan
function fetchWeatherForecast(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const dailyData = data.daily;
            const forecastHtml = `
                <h1>3-Day Weather Forecast</h1>
                <p>Weather for: ${districts.find(d => d.apiUrl === apiUrl).name}, Kota Malang</p>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Max Temp (°C)</th>
                            <th>Min Temp (°C)</th>
                            <th>Precipitation (mm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dailyData.time.map((date, index) => `
                            <tr>
                                <td>${new Date(date).toLocaleDateString()}</td>
                                <td>${dailyData.temperature_2m_max[index]}</td>
                                <td>${dailyData.temperature_2m_min[index]}</td>
                                <td>${dailyData.precipitation_sum[index]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('weatherModalContent').innerHTML = forecastHtml;
            showModal();
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function showModal() {
    document.getElementById('weatherModal').style.display = 'block';
}

function hideModal() {
    document.getElementById('weatherModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById('weatherModal')) {
        hideModal();
    }
};