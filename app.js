console.log("app.js loaded");

import { ascii7BitsForText } from "./ascii.js";

// map bit → physical level
function bitToLevel(b) {
  return b === "1" ? "8.0" : "2.0";
}

// clamp helper
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// apply noise U[-Δ, +Δ]
function addNoise(levelString, amp) {
  if (!levelString.trim()) return "";

  // split into lines first
  const lines = levelString.trim().split(/\n+/);

  return lines.map(line => {
    const nums = line.trim().split(/\s+/).map(parseFloat);
    const noisy = nums.map(x => {
      const jitter = (Math.random() * 2 - 1) * amp;   // U[-amp, +amp]
      const y = clamp(x + jitter, 0.0, 9.9);
      return y.toFixed(1);
    });
    return noisy.join(" ");
  }).join("\n");   // <-- put the newline back
}




// Tab switcher (keep whatever you already had)
document.getElementById('tab-encode').onclick = () => {
  document.getElementById('encode-view').classList.remove('hidden');
  document.getElementById('decode-view').classList.add('hidden');
};
document.getElementById('tab-decode').onclick = () => {
  document.getElementById('decode-view').classList.remove('hidden');
  document.getElementById('encode-view').classList.add('hidden');
};


document.getElementById('encode-btn').onclick = () => {
  const inputs = Array.from(document.querySelectorAll('#char-grid .char'));
  const rawText = inputs.map(i => (i.value || "").slice(0,1)).join("");

  const bits = ascii7BitsForText(rawText); // array of 7-bit strings
  const clean = bits.map(b => b.split("").map(bitToLevel).join(" ")).join("\n");

  document.getElementById('encode-output').textContent = clean || "(no input)";

  const amp = Number(document.getElementById("noise").value);
  document.getElementById('encode-output-noisy').textContent =
    clean ? addNoise(clean, amp) : "";
};

const noiseSlider = document.getElementById("noise");

noiseSlider.addEventListener("input", () => {
  const amp = Number(noiseSlider.value);
  noiseAmpSpan.textContent = amp.toFixed(1);

  const clean = document.getElementById('encode-output').textContent;
  document.getElementById('encode-output-noisy').textContent =
    clean ? addNoise(clean, amp) : "";
});



function decodeLevelsToText(input) {
  // 1. split on any whitespace
  const nums = input.trim().split(/\s+/);

  // 2. convert each number → bit
  const bits = nums.map(n => {
    const value = parseFloat(n);
    return value >= 5 ? "1" : "0";   // fixed threshold
  });

  // 3. group into chunks of 7
  const chars = [];
  for (let i = 0; i < bits.length; i += 7) {
    const chunk = bits.slice(i, i + 7).join("");
    if (chunk.length < 7) break; // ignore incomplete tail

    // 4. convert each 7-bit chunk → ASCII char
    const code = parseInt(chunk, 2);
    chars.push(String.fromCharCode(code));
  }

  return chars.join("");
}

document.getElementById('decode-btn').onclick = () => {
  const raw = document.getElementById('decode-input').value;
  const decoded = decodeLevelsToText(raw);
  document.getElementById('decode-output').textContent = decoded || "(no output)";
};
