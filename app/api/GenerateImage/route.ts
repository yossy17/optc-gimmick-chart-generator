// app/api/GenerateImage/route.ts
import { NextResponse } from "next/server";
import { createCanvas } from "canvas";
import { SelectedEffect } from "@/components/types";

export async function POST(request: Request) {
  try {
    const { title, effects }: { title: string; effects: SelectedEffect[] } =
      await request.json();

    const titleFontSize = 16;
    const effectFontSize = 12;
    const canvasPadding = 30;
    const maxTitleWidth = 400; // 最大幅を設定

    // 仮のキャンバスを作成してタイトルの長さを測定
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = `bold ${titleFontSize}px 'Noto Sans JP', sans-serif`;

    // タイトルが複数行になる場合のための幅と高さの計算
    const lines = title.split("\n"); // 改行で分割
    let titleWidth = 0;
    let titleHeight = 0;

    lines.forEach((line) => {
      const lineWidth = tempCtx.measureText(line).width;
      titleWidth = Math.max(titleWidth, lineWidth);
      titleHeight += titleFontSize * 1.5; // 行間を含む
    });

    const canvasWidth = Math.max(titleWidth + canvasPadding * 2, maxTitleWidth);
    const textHeight =
      effectFontSize * 1.5 * (effects.length + 1) + titleHeight;
    const canvasHeight = canvasPadding * 2 + textHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // コンテキスト取得の確認
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // 背景のグラデーション
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#e9e9e9");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 枠線を描画
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

    // タイトルの描画
    ctx.font = `bold ${titleFontSize}px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#333333";

    let titleY = canvasPadding;
    lines.forEach((line) => {
      ctx.fillText(line, canvasWidth / 2, titleY);
      titleY += titleFontSize * 1.5; // 行間を含む
    });

    // 効果の描画
    ctx.font = `${effectFontSize}px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#555555";

    effects.forEach((item: SelectedEffect, index: number) => {
      let effectText = `${item.effect}`;
      if (item.turns !== undefined) {
        effectText +=
          item.turns === "完全解除" ? " (完全解除)" : ` (${item.turns}ターン)`;
      }
      console.log(`Drawing: ${effectText}`);
      ctx.fillText(
        effectText,
        canvasPadding + 10,
        canvasPadding + titleHeight + 20 + effectFontSize * 1.5 * index
      );
    });

    // 画像データをBase64エンコードした文字列として取得
    const imageData = canvas.toDataURL("image/png");
    console.log("Image generated successfully");

    return NextResponse.json({ imageData });
  } catch (error) {
    console.error("Detailed error in GenerateImage:", error);
    return NextResponse.json(
      {
        error:
          "Error generating image: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
