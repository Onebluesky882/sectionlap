import { Hono } from "hono";
import type { Bindings, GenerateResult } from "./types";
import { parsePlan } from "./claudeCode";
import { renderPlan } from "./visualRender";
import { presignGet } from "./r2";
import { generateStepImages } from "./imageGen";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/generate", async (c) => {
  const body = await c.req.json<{ promptText?: string }>().catch(() => ({}) as { promptText?: string });
  const promptText = body.promptText?.trim();
  if (!promptText) {
    return c.json({ error: "promptText is required" }, 400);
  }

  try {
    const plan = await parsePlan(c.env, promptText);
    const planId = crypto.randomUUID();
    // Every step gets an illustration now — linear roadmaps included, not
    // just cycle diagrams.
    const stepImages = await generateStepImages(c.env, plan.steps);
    const { r2KeyGif, r2KeyMp4 } = await renderPlan(c.env, planId, plan, stepImages);
    const [gifUrl, mp4Url] = await Promise.all([
      presignGet(c.env, r2KeyGif),
      presignGet(c.env, r2KeyMp4),
    ]);

    const result: GenerateResult = { ...plan, planId, gifUrl, mp4Url };
    return c.json(result);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "generate failed" }, 502);
  }
});

app.get("/", (c) => c.html(PAGE));

export default app;

const PAGE = /* html */ `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Visual Plan</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px 16px 64px; background: #F7FAFA; color: #1A2332;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  }
  main { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  p.sub { color: #64748B; font-size: 14px; margin: 0 0 24px; }
  textarea {
    width: 100%; min-height: 110px; padding: 12px 14px; border-radius: 10px;
    border: 1px solid #DDE8E6; font: inherit; resize: vertical; background: #fff;
  }
  button {
    margin-top: 12px; background: #6AA098; color: #fff; border: none;
    border-radius: 999px; padding: 11px 24px; font-size: 14px; font-weight: 600;
    cursor: pointer;
  }
  button:disabled { opacity: .5; cursor: default; }
  #result { margin-top: 28px; }
  .err { color: #A34B4B; font-size: 14px; margin-top: 12px; }
  .card {
    background: #fff; border: 1px solid #DDE8E6; border-radius: 12px;
    padding: 18px; margin-top: 12px;
  }
  .card h2 { font-size: 17px; margin: 0 0 10px; }
  .card img { max-width: 100%; border-radius: 8px; display: block; margin-bottom: 12px; }
  .steps { display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0 0 14px; list-style: none; }
  .steps li { font-size: 13.5px; color: #1A2332; }
  .steps li.milestone { font-weight: 600; color: #4D8078; }
  .links a { font-size: 13px; color: #4D8078; margin-right: 16px; }
</style>
</head>
<body>
<main>
  <h1>สร้างแผนการเรียนเป็นภาพ</h1>
  <p class="sub">พิมพ์แผนการเรียนหรือหัวข้อที่ต้องการ แล้วให้ AI แตกเป็นขั้นตอนพร้อมภาพเคลื่อนไหว</p>
  <textarea id="prompt" placeholder="เช่น: เรียนแคลคูลัส ลิมิต อนุพันธ์ อินทิกรัล"></textarea><br>
  <button id="go">สร้างแผนภาพ</button>
  <div id="result"></div>
</main>
<script>
  const btn = document.getElementById('go');
  const promptEl = document.getElementById('prompt');
  const resultEl = document.getElementById('result');

  btn.addEventListener('click', async () => {
    const promptText = promptEl.value.trim();
    if (!promptText) return;
    btn.disabled = true;
    btn.textContent = 'กำลังสร้าง...';
    resultEl.innerHTML = '';
    try {
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'generate failed');
      renderResult(data);
    } catch (e) {
      resultEl.innerHTML = '<p class="err">' + (e && e.message ? e.message : e) + '</p>';
    } finally {
      btn.disabled = false;
      btn.textContent = 'สร้างแผนภาพ';
    }
  });

  function renderResult(data) {
    const steps = data.steps.map((s) =>
      '<li class="' + (s.milestone ? 'milestone' : '') + '">' + s.label + (s.sublabel ? ' — ' + s.sublabel : '') + '</li>'
    ).join('');
    resultEl.innerHTML =
      '<div class="card">' +
        '<h2>' + data.title + '</h2>' +
        '<img src="' + data.gifUrl + '" alt="' + data.title + '">' +
        '<ul class="steps">' + steps + '</ul>' +
        '<div class="links">' +
          '<a href="' + data.gifUrl + '" target="_blank" rel="noopener">GIF</a>' +
          '<a href="' + data.mp4Url + '" target="_blank" rel="noopener">MP4</a>' +
        '</div>' +
      '</div>';
  }
</script>
</body>
</html>`;
