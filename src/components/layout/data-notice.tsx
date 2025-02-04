import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

export default function DataNotice() {
  return (
    <details open>
      <summary>How your data is handled</summary>
      <div className="gap-2 grid">
        <Alert className="bg-blue-300 shadow-md w-fit text-lg">
          {/* <DatabaseIcon className="w-5 h-5" /> */}
          <AlertTitle className="font-bold">Fully client-side</AlertTitle>
          <AlertDescription>
            The app is designed to make all API requests from the client side
            (from your local machine directly to Tailscale and Cloudflare
            endpoints), your keys and data are never seen by me nor my server.
          </AlertDescription>
        </Alert>
        <Alert className="bg-yellow-300 shadow-md w-fit text-lg">
          {/* <DatabaseIcon className="w-5 h-5" /> */}
          <AlertTitle className="font-bold">How your data persists</AlertTitle>
          <AlertDescription>
            {`The keys and relevant information are being stored in your local storage.`}
          </AlertDescription>
        </Alert>
      </div>
    </details>
  );
}
