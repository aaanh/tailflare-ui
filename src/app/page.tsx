import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  return (
    <div>
      <Alert className="bg-blue-400 shadow-md m-4 w-fit text-lg">
        {/* <DatabaseIcon className="w-5 h-5" /> */}
        <AlertTitle className="font-bold">Just wanna let u know!</AlertTitle>
        <AlertDescription>
          The app is designed to make all API requests from the client side
          (from your local machine directly to Tailscale and Cloudflare
          endpoints), your keys and data are never seen by me nor my server.
        </AlertDescription>
      </Alert>
    </div>
  );
}
