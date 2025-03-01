export default function Footer() {
  return (
    <footer className="border-grid border rounded-md py-6 md:px-8 md:py-0 mt-auto dark:bg-foreground/5">
      <div className="container-wrapper">
        <div className="container py-4">
          <div className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href={"https://aaanh.com"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Anh Hoang Nguyen
            </a>
            . The source code is available on{" "}
            <a
              href={"https://github.com/aaanh/tailflare-ui"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            . Original CLI in Golang{""}
            <a
              href={"https://github.com/aaanh/tailflare"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Tailflare
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
