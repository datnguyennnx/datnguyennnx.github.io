export default function Footer() {
  return (
    <footer className="flex flex-col">
      <div className="flex w-full">
        <p className="flex text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} datnguyennnx. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
