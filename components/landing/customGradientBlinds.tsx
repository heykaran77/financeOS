import GradientBlinds from '../GradientBlinds';

export default function CustomGradientBlinds() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-black">
      <GradientBlinds
        gradientColors={['#0c0c0c', '#10B981']}
        angle={20}
        noise={0.5}
        blindCount={16}
        blindMinWidth={60}
        spotlightRadius={0.5}
        spotlightSoftness={1}
        spotlightOpacity={1}
        mouseDampening={0.15}
        distortAmount={0}
        shineDirection="left"
        mixBlendMode="lighten"
      />
    </div>
  );
}
