import { useEffect, useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import Svg, { Image as SvgImage, Path } from "react-native-svg";
import type * as Y from "yjs";
import type { Stroke } from "../types";

const COLORS = ["#1f2733", "#e53935", "#1e88e5", "#43a047", "#fbc02d"];

interface Props {
  strokes: Y.Array<Stroke> | undefined;
  width: number;
  height: number;
  backgroundImageUrl?: string;
}

function toPath(stroke: Stroke): string {
  if (stroke.points.length === 0) return "";
  const [first, ...rest] = stroke.points;
  return `M${first.x},${first.y} ${rest.map((p) => `L${p.x},${p.y}`).join(" ")}`;
}

// Shared drawing surface synced via Yjs/y-websocket (Stage 4a protocol).
export function SyncCanvas({ strokes, width, height, backgroundImageUrl }: Props) {
  const [color, setColor] = useState(COLORS[0]);
  const [committed, setCommitted] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<{ x: number; y: number }[] | null>(null);
  const drawRef = useRef<{ x: number; y: number }[] | null>(null);

  useEffect(() => {
    if (!strokes) return;
    const sync = () => setCommitted(strokes.toArray());
    sync();
    strokes.observe(sync);
    return () => strokes.unobserve(sync);
  }, [strokes]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        drawRef.current = [{ x: locationX, y: locationY }];
        setCurrent(drawRef.current);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (!drawRef.current) return;
        drawRef.current = [...drawRef.current, { x: locationX, y: locationY }];
        setCurrent([...drawRef.current]);
      },
      onPanResponderRelease: () => {
        const pts = drawRef.current;
        drawRef.current = null;
        setCurrent(null);
        if (!pts || pts.length < 2 || !strokes) return;
        strokes.push([{ color, width: 3, points: pts }]);
      },
    })
  ).current;

  const pending = current ? [{ color, width: 3, points: current }] : [];

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        {COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            className="w-6 h-6 rounded-full border-2"
            style={{ backgroundColor: c, borderColor: c === color ? "#000" : "transparent" }}
          />
        ))}
        <Pressable
          className="ml-auto bg-muted rounded-lg px-3 py-1.5"
          onPress={() => strokes?.delete(0, strokes.length)}
        >
          <Text className="text-sm font-semibold text-foreground">Clear</Text>
        </Pressable>
      </View>
      <View
        className="bg-card border border-border rounded-lg overflow-hidden"
        style={{ width, height }}
        {...pan.panHandlers}
      >
        <Svg width={width} height={height}>
          {backgroundImageUrl && (
            <SvgImage
              href={{ uri: backgroundImageUrl }}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
            />
          )}
          {[...committed, ...pending].map((s, i) => (
            <Path
              key={i}
              d={toPath(s)}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}
