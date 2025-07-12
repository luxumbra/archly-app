import { Section, Row, Column, Img, Link } from "@react-email/components";
import { constants } from "../../../../constants";

const socials = constants.SOCIALS;

export default function EmailHeader() {
  return (
    <Section className="relative px-8 py-8 text-white bg-primary-background">
      <Row>
        <Column className="w-[80%]">
          <Img
            src="https://cdn.yore.earth/assets/images/yore-logo.png"
            alt="Yore Logo"
            className="h-20"
          />
        </Column>
        <Column align="right">
          <Row align="right">
            <Column>
              <Link href={socials.x}>
                <Img
                  alt="X"
                  className="mx-[4px]"
                  height="36"
                  src="https://react.email/static/x-logo.png"
                  width="36"
                />
              </Link>
            </Column>
            <Column>
              <Link href={socials.instagram}>
                <Img
                  alt="Instagram"
                  className="mx-[4px]"
                  height="36"
                  src="https://react.email/static/instagram-logo.png"
                  width="36"
                />
              </Link>
            </Column>
            <Column>
              <Link href={socials.facebook}>
                <Img
                  alt="Facebook"
                  className="mx-[4px]"
                  height="36"
                  src="https://react.email/static/facebook-logo.png"
                  width="36"
                />
              </Link>
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}
