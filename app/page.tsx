import Container from '@/components/common/container';
import { Button } from '@/components/ui/button';

export default function Main() {
  return (
    <Container>
      <div className="rounded-xl bg-red-300 px-2 py-1 text-xl font-semibold">
        <h1>Main</h1>
        <Button>Login</Button>
      </div>
    </Container>
  );
}
