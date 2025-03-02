export default function Footer() {
  return (
    <footer className="dark:bg-foreground/5 mt-auto md:px-8 py-6 md:py-0 border border-grid rounded-md">
      <div className="container-wrapper">
        <div className="py-4 container">
          <div className="text-muted-foreground text-sm md:text-left text-center text-balance leading-loose">
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
            . Original CLI in Golang{" "}
            <a
              href={"https://github.com/aaanh/tailflare"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Tailflare
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  );
}
