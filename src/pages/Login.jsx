import { useApp } from "../context/AppContext.jsx";
import { Button, Card } from "../components/ui.jsx";

export default function Login() {
  const { signIn, loginMsg } = useApp();
  return (
    <div className="grid min-h-screen place-items-center p-5">
      <Card className="w-full max-w-sm py-10 text-center">
        <h1 className="font-display text-6xl">
          FIT<span className="text-brand">TRACK</span>
        </h1>
        <p className="my-4 text-mute">
          Your private workout log. Data and photos are stored in your own
          Google Drive.
        </p>
        <Button variant="primary" onClick={signIn}>
          Sign in with Google
        </Button>
        <p className="mt-4 text-sm text-mute" role="status">
          {loginMsg}
        </p>
      </Card>
    </div>
  );
}
