// pages/scroll-test.tsx
import { Card, CardContent } from "@/components/ui/card";

export default function ScrollTest() {
  const lines = Array.from({ length: 1000 }, (_, i) => `This is line number ${i + 1}`);

  return (
    <div className="min-h-screen p-4 bg-gray-50 overflow-y-scroll space-y-2">
      {lines.map((line, index) => (
        <Card key={index}>
          <CardContent className="p-4 text-sm text-gray-800">
            {line}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
