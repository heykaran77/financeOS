import BentoCard from '../common/bento-card';

export default function Features() {
  return (
    <div className="mx-auto grid grid-cols-1 gap-4 py-20 md:grid-cols-2">
      {}
      {Array.from({ length: 6 }).map((_, i) => (
        <BentoCard
          key={i}
          title="BentoCard"
          description="BentoCard"
          className="h-40 w-full max-w-sm border-none shadow-none"
        />
      ))}
    </div>
  );
}
