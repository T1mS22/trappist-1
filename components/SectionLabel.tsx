type SectionLabelProps = {
  children: string;
};

/** Mono section label, e.g. `// about`. */
export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="font-mono text-xs tracking-[0.04em] text-primary lowercase">
      {`// ${children}`}
    </p>
  );
}
