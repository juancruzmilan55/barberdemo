import { content } from '@/lib/content';
import { ManageButton } from './ManageButton';

export function Footer() {
  const { brand, footer, header } = content;
  const wa = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(header.whatsappText)}`;

  return (
    <footer id="contacto" className="section overflow-hidden pb-10">
      <div className="wrap">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="eyebrow">{footer.location}</p>
            <p className="mt-3 text-muted">{brand.address}</p>
            <a href={brand.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-goldtext underline underline-offset-4">
              Ver en Google Maps
            </a>
          </div>
          <div>
            <p className="eyebrow">{footer.hours}</p>
            <ul className="mt-3 space-y-1 text-muted">
              {footer.hoursLines.map((l) => (<li key={l}>{l}</li>))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">{footer.contact}</p>
            <ul className="mt-3 space-y-1 text-muted">
              <li><a href={`tel:+54${brand.phone}`} className="hover:text-fg">{brand.phone}</a></li>
              <li><a href={`mailto:${brand.email}`} className="hover:text-fg">{brand.email}</a></li>
              <li><a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fg">{brand.instagram}</a></li>
            </ul>
            <div className="mt-4 flex flex-col items-start gap-3">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary !h-11">WhatsApp</a>
              <ManageButton label={footer.manageBooking} className="text-sm text-goldtext underline underline-offset-4" />
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="mt-16 select-none overflow-hidden whitespace-nowrap text-center font-serif text-[15vw] leading-none text-fg/5 md:text-[130px]">
          {brand.name}
        </div>
        <p className="mt-6 text-center text-xs text-muted">© {new Date().getFullYear()} {brand.name}</p>
      </div>
    </footer>
  );
}
