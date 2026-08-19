const fs = require('fs');
const https = require('https');

// Baca API Key dari config.json
let apiKey = 'YOUR_WATCHMODE_API_KEY_HERE';
if (fs.existsSync('config.json')) {
    const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    if (config.watchmode_api_key) apiKey = config.watchmode_api_key;
}

const url = `https://api.watchmode.com/v1/list-titles/?apiKey=${apiKey}&limit=1`;

https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const data = JSON.parse(rawData);
            if (data.titles && data.titles.length > 0) {
                const latest = data.titles[0];
                
                const newTitle = `Nonton ${latest.title} (${latest.year}) - CineStream`;
                const newDesc = `Cek trailer dan ketersediaan platform streaming resmi untuk ${latest.title}.`;
                const newImage = latest.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200';

                // Baca file index.html
                let html = fs.readFileSync('index.html', 'utf8');

                // Update isi Meta Tag di index.html secara otomatis
                html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${newTitle}" />`);
                html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${newDesc}" />`);
                html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${newImage}" />`);

                // Simpan kembali file index.html
                fs.writeFileSync('index.html', html, 'utf8');
                console.log(`[BERHASIL] Open Graph diupdate dengan video: ${latest.title}`);
            }
        } catch (e) {
            console.error('[GAGAL] Error parsing API data:', e.message);
        }
    });
}).on('error', (e) => {
    console.error('[GAGAL] Error fetching API:', e.message);
});
