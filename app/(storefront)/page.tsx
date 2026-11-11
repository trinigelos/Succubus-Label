"use client";

import { ProductTile } from "@/components/shop/ProductTile";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getFeaturedProducts } from "@/lib/data/products";
import { withBasePath } from "@/lib/base-path";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const INSTAGRAM_PHOTOS = [
  { file: "choice.jpg", alt: "Post: Black is a choice" },
  { file: "viola.jpg", alt: "Post: shooting in una stanza viola" },
  { file: "nessuno.jpg", alt: "Post: Nessuno lo vede, io sì" },
  { file: "tramonto.jpg", alt: "Post: reggiseno al tramonto" },
  { file: "graffiti.jpg", alt: "Post: set con collare, luce viola" },
  { file: "tee.jpg", alt: "Post: Ma vai da lui vestita così?" },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    getFeaturedProducts(4)
      .then(setFeatured)
      .catch(() => {
        // Supabase not configured yet: the home keeps running without featured products
      });
  }, []);

  return (
    <main>
      <section id="home" className={styles.hero}>
        <div className={styles.heroTitle}>
          <h1>SUCCUBUS</h1>
          <span className={styles.heroSub}>LABEL</span>
          <p className={styles.heroClaim}>The black label of lingerie</p>
        </div>
        <div className={styles.heroImages}>
          <Image
            src={withBasePath("/img/casa.jpg")}
            alt="Lingerie nera in una casa abbandonata"
            width={800}
            height={1000}
            priority
          />
          <Image
            src={withBasePath("/img/graffiti.jpg")}
            alt="Set in rete nera con collare, luce viola"
            width={800}
            height={1000}
            priority
          />
          <Image
            src={withBasePath("/img/tramonto.jpg")}
            alt="Reggiseno nero al tramonto"
            width={800}
            height={1000}
            priority
          />
        </div>
        <div className={styles.heroActions}>
          <Link href="/shop" className={styles.btnPrimary}>
            Shop lingerie
          </Link>
          <Link href="/#daytoday" className={styles.btnSecondary}>
            Day to day — presto
          </Link>
        </div>
      </section>

      <section className={styles.manifesto}>
        <p className={styles.manifestoLines}>
          <span>Black is</span>
          <span className={styles.manifestoImpact}>A CHOICE</span>
        </p>
        <p className={styles.manifestoText}>
          Intimates &amp; noir aesthetics. Ogni pezzo è nero, sempre — e lo
          indosso prima io.
        </p>
      </section>

      {featured.length > 0 ? (
        <section id="lingerie" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionKicker}>
              <span>Collezione</span>
              <h2>Lingerie</h2>
            </div>
            <div className={styles.sectionCta}>
              <Link href="/shop">Tutto</Link>
            </div>
          </div>
          <div className={styles.featuredGrid}>
            {featured.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="daytoday" className={styles.daytoday}>
        <div className={styles.daytodayInner}>
          <div className={styles.daytodayText}>
            <span className={styles.daytodayKicker}>Nuova linea · in arrivo</span>
            <h2 className={styles.daytodayHeading}>
              <span>Day to day.</span>
              <span className={styles.daytodayImpact}>ONLY BLACK</span>
            </h2>
            <p className={styles.daytodayCopy}>
              Lo stesso nero, fuori casa. Capi per tutti i giorni, pensati per
              essere portati con la stessa attitudine.
            </p>
            <WaitlistForm
              list="day-to-day"
              label="La tua email"
              buttonLabel="Avvisami"
              className={styles.daytodayForm}
            />
          </div>
          <div className={styles.daytodayImages}>
            <Image
              src={withBasePath("/img/tee.jpg")}
              alt="Lei con una t-shirt nera oversize Succubus"
              width={400}
              height={533}
            />
            <Image
              src={withBasePath("/img/onlyblack.jpg")}
              alt="Selfie allo specchio, tutta in nero"
              width={400}
              height={533}
            />
            <Image
              src={withBasePath("/img/serious.jpg")}
              alt="Selfie allo specchio con abito nero corto"
              width={400}
              height={533}
            />
          </div>
        </div>
      </section>

      <section id="chi" className={styles.chi}>
        <div className={styles.chiInner}>
          <Image
            src={withBasePath("/img/candele.jpg")}
            alt="Di spalle, maglione nero e candele accese"
            width={520}
            height={650}
            className={styles.chiImage}
          />
          <div className={styles.chiText}>
            <span className={styles.chiKicker}>Chi sono</span>
            <h2 className={styles.chiHeading}>
              <span>Nessuno lo vede.</span>
              <span className={styles.chiImpact}>IO SÌ.</span>
            </h2>
            <p className={styles.chiQuote}>
              &ldquo;Kinda chic — il modo in cui sto creando qualcosa
              nell&apos;ombra.&rdquo;
            </p>
            <p className={styles.chiCopy}>
              La mia storia arriva presto qui: chi sono, come è nata Succubus
              il 17.10, come scelgo e preparo ogni pezzo.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <div className={styles.detailCard}>
          <Image
            src={withBasePath("/img/gatto.jpg")}
            alt="Gatto nero accanto al cartellino Succubus"
            width={400}
            height={400}
          />
          <span className={styles.detailTitle}>Spedizioni 24/48h</span>
          <span className={styles.detailCopy}>
            Ogni ordine parte impacchettato a mano.
          </span>
        </div>
        <div className={styles.detailCard}>
          <Image
            src={withBasePath("/img/polsino.jpg")}
            alt="Polsino in pelle nera"
            width={400}
            height={400}
          />
          <span className={styles.detailTitle}>Le ragazze Succubus</span>
          <span className={styles.detailCopy}>
            Le clienti che indossano i pezzi, con il loro permesso.
          </span>
        </div>
        <div className={styles.detailCard}>
          <Image
            src={withBasePath("/img/ciliegie.jpg")}
            alt="Ombra di una mano con ciliegie su un muro arancione"
            width={400}
            height={400}
          />
          <span className={styles.detailTitle}>Anche su Vinted</span>
          <span className={styles.detailCopy}>
            Per spedizioni convenienti in tutta Europa.
          </span>
        </div>
      </section>

      <section className={styles.instagram}>
        <div className={styles.instagramInner}>
          <div className={styles.instagramHeading}>
            <h2>@succubus.label_17.10</h2>
            <a href="https://www.instagram.com/succubus.label_17.10/">
              Seguimi su Instagram →
            </a>
          </div>
          <div className={styles.instagramGrid}>
            {INSTAGRAM_PHOTOS.map((photo) => (
              <Image
                key={photo.file}
                src={withBasePath(`/img/${photo.file}`)}
                alt={photo.alt}
                width={340}
                height={425}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
