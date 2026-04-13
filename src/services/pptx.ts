import pptxgen from "pptxgenjs";
import { Slide } from "./ai";

const themeColorsHex = {
  blue: "2563EB",
  emerald: "059669",
  violet: "7C3AED",
  rose: "E11D48",
  amber: "D97706",
  slate: "1E293B",
};

export async function exportToPPTX(slides: Slide[], filename: string = "Presentation.pptx") {
  const pres = new pptxgen();

  pres.layout = "LAYOUT_16x9";

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    const layout = slideData.layout || "content-split";
    const theme = slideData.themeColor || "blue";
    const primaryColor = themeColorsHex[theme as keyof typeof themeColorsHex] || themeColorsHex.blue;

    switch (layout) {
      case "title":
        slide.background = { color: primaryColor };
        if (slideData.imageKeyword) {
          const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(slideData.imageKeyword)}/1920/1080`;
          slide.addImage({
            path: imageUrl,
            x: 0,
            y: 0,
            w: "100%",
            h: "100%",
            sizing: { type: "cover", w: "100%", h: "100%" },
            transparency: 70, // Simulate the overlay
          });
        }
        slide.addText(slideData.title, {
          x: "10%",
          y: "35%",
          w: "80%",
          h: "20%",
          fontSize: 48,
          bold: true,
          color: "FFFFFF",
          align: "center",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: "10%",
            y: "55%",
            w: "80%",
            h: "10%",
            fontSize: 28,
            color: "E5E7EB",
            align: "center",
            valign: "top",
          });
        }
        if (slideData.content && slideData.content.length > 0) {
          slide.addText(slideData.content[0], {
            x: "10%",
            y: "65%",
            w: "80%",
            h: "15%",
            fontSize: 24,
            color: "F3F4F6",
            align: "center",
            valign: "top",
          });
        }
        break;

      case "section":
        slide.background = { color: primaryColor };
        slide.addShape(pres.ShapeType.rect, { x: "10%", y: "30%", w: "10%", h: 0.1, fill: { color: "FFFFFF", transparency: 50 } });
        slide.addText(slideData.title, {
          x: "10%",
          y: "35%",
          w: "80%",
          h: "20%",
          fontSize: 44,
          bold: true,
          color: "FFFFFF",
          align: "left",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: "10%",
            y: "55%",
            w: "80%",
            h: "15%",
            fontSize: 28,
            color: "E5E7EB",
            align: "left",
            valign: "top",
          });
        }
        break;

      case "content-full":
        slide.background = { color: "FFFFFF" };
        slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: primaryColor } });
        slide.addText(slideData.title, {
          x: "5%",
          y: "5%",
          w: "90%",
          h: "10%",
          fontSize: 32,
          bold: true,
          color: "111827",
          align: "left",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: "5%",
            y: "15%",
            w: "90%",
            h: "10%",
            fontSize: 20,
            color: "6B7280",
            align: "left",
            valign: "top",
          });
        }
        if (slideData.content && slideData.content.length > 0) {
          slide.addText(
            slideData.content.map((point) => ({ text: point, options: { bullet: true } })),
            {
              x: "5%",
              y: slideData.subtitle ? "25%" : "15%",
              w: "90%",
              h: slideData.subtitle ? "70%" : "80%",
              fontSize: 20,
              color: "374151",
              valign: "top",
              margin: 0.1,
              lineSpacing: 28,
            }
          );
        }
        break;

      case "grid":
        slide.background = { color: "F8F9FA" };
        slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: primaryColor } });
        slide.addText(slideData.title, {
          x: "5%",
          y: "5%",
          w: "90%",
          h: "10%",
          fontSize: 32,
          bold: true,
          color: "111827",
          align: "left",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: "5%",
            y: "15%",
            w: "90%",
            h: "10%",
            fontSize: 20,
            color: "6B7280",
            align: "left",
            valign: "top",
          });
        }
        
        // Simple 2x2 grid calculation
        if (slideData.content && slideData.content.length > 0) {
          const startY = slideData.subtitle ? 2.0 : 1.5;
          slideData.content.forEach((point, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const xPos = col === 0 ? 0.5 : 5.2;
            const yPos = startY + (row * 1.5);
            
            // Number badge
            slide.addShape(pres.ShapeType.ellipse, { x: xPos, y: yPos, w: 0.4, h: 0.4, fill: { color: primaryColor } });
            slide.addText(`${i + 1}`, { x: xPos, y: yPos, w: 0.4, h: 0.4, color: "FFFFFF", fontSize: 14, bold: true, align: "center", valign: "middle" });
            
            // Text
            slide.addText(point, {
              x: xPos + 0.5,
              y: yPos,
              w: 4.0,
              h: 1.2,
              fontSize: 16,
              color: "374151",
              valign: "top",
              lineSpacing: 22,
            });
          });
        }
        break;

      case "chart":
        slide.background = { color: "FFFFFF" };
        slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.15, fill: { color: primaryColor } });
        slide.addText(slideData.title, {
          x: "5%",
          y: "5%",
          w: "90%",
          h: "10%",
          fontSize: 32,
          bold: true,
          color: "111827",
          align: "left",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(slideData.subtitle, {
            x: "5%",
            y: "15%",
            w: "90%",
            h: "10%",
            fontSize: 20,
            color: "6B7280",
            align: "left",
            valign: "top",
          });
        }

        if (slideData.chartData && slideData.chartData.length > 0) {
          const chartTypeMap: Record<string, any> = {
            bar: pres.ChartType.bar,
            line: pres.ChartType.line,
            pie: pres.ChartType.pie,
            area: pres.ChartType.area,
          };
          const pptxChartType = chartTypeMap[slideData.chartType || "bar"] || pres.ChartType.bar;
          
          const chartData = [
            {
              name: "Series 1",
              labels: slideData.chartData.map(d => d.name),
              values: slideData.chartData.map(d => d.value),
            }
          ];

          slide.addChart(pptxChartType, chartData, {
            x: "5%",
            y: slideData.subtitle ? "25%" : "15%",
            w: "45%",
            h: slideData.subtitle ? "70%" : "80%",
            showLegend: false,
            showTitle: false,
          });
        }

        if (slideData.content && slideData.content.length > 0) {
          slide.addText(
            slideData.content.map((point) => ({ text: point, options: { bullet: true } })),
            {
              x: "55%",
              y: slideData.subtitle ? "25%" : "15%",
              w: "40%",
              h: slideData.subtitle ? "70%" : "80%",
              fontSize: 18,
              color: "374151",
              valign: "top",
              margin: 0.1,
              lineSpacing: 24,
            }
          );
        }
        break;

      case "quote":
        slide.background = { color: "F8F9FA" };
        slide.addText(`"${slideData.title}"`, {
          x: "10%",
          y: "30%",
          w: "80%",
          h: "40%",
          fontSize: 36,
          bold: true,
          italic: true,
          color: "111827",
          align: "center",
          valign: "middle",
        });
        if (slideData.subtitle) {
          slide.addText(`— ${slideData.subtitle}`, {
            x: "10%",
            y: "70%",
            w: "80%",
            h: "15%",
            fontSize: 24,
            color: primaryColor,
            align: "center",
            valign: "top",
          });
        }
        break;

      case "content-split":
      default:
        slide.background = { color: "FFFFFF" };
        if (slideData.imageKeyword) {
          const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(slideData.imageKeyword)}/1920/1080`;
          slide.addImage({
            path: imageUrl,
            x: "50%",
            y: 0,
            w: "50%",
            h: "100%",
            sizing: { type: "cover", w: "50%", h: "100%" },
          });

          slide.addShape(pres.ShapeType.rect, { x: "5%", y: "10%", w: "5%", h: 0.05, fill: { color: primaryColor } });
          slide.addText(slideData.title, {
            x: "5%",
            y: "15%",
            w: "40%",
            h: "15%",
            fontSize: 32,
            bold: true,
            color: "111827",
            valign: "middle",
          });
          
          if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
              x: "5%",
              y: "30%",
              w: "40%",
              h: "10%",
              fontSize: 18,
              color: "6B7280",
              valign: "top",
            });
          }

          if (slideData.content && slideData.content.length > 0) {
            slide.addText(
              slideData.content.map((point) => ({ text: point, options: { bullet: true } })),
              {
                x: "5%",
                y: slideData.subtitle ? "40%" : "30%",
                w: "40%",
                h: slideData.subtitle ? "55%" : "65%",
                fontSize: 18,
                color: "374151",
                valign: "top",
                margin: 0.1,
                lineSpacing: 24,
              }
            );
          }
        } else {
          slide.addShape(pres.ShapeType.rect, { x: "5%", y: "5%", w: "5%", h: 0.05, fill: { color: primaryColor } });
          slide.addText(slideData.title, {
            x: "5%",
            y: "10%",
            w: "90%",
            h: "10%",
            fontSize: 36,
            bold: true,
            color: "111827",
            align: "left",
            valign: "middle",
          });
          
          if (slideData.subtitle) {
            slide.addText(slideData.subtitle, {
              x: "5%",
              y: "20%",
              w: "90%",
              h: "10%",
              fontSize: 20,
              color: "6B7280",
              align: "left",
              valign: "top",
            });
          }

          if (slideData.content && slideData.content.length > 0) {
            slide.addText(
              slideData.content.map((point) => ({ text: point, options: { bullet: true } })),
              {
                x: "5%",
                y: slideData.subtitle ? "30%" : "20%",
                w: "90%",
                h: slideData.subtitle ? "65%" : "75%",
                fontSize: 24,
                color: "374151",
                valign: "top",
                margin: 0.1,
                lineSpacing: 32,
              }
            );
          }
        }
        break;
    }

    // Add Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  });

  await pres.writeFile({ fileName: filename });
}
