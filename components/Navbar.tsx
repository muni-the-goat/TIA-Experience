"use client";

import StaggeredMenu, { type StaggeredMenuItem, type StaggeredMenuSocialItem } from "./StaggeredMenu";

const menuItems: StaggeredMenuItem[] = [
  { label: "Home", ariaLabel: "Back to the top", link: "#top" },
  { label: "Exhibition", ariaLabel: "Enter the exhibition", link: "#exhibition" },
  { label: "Artifacts", ariaLabel: "Browse the artifacts", link: "#artifacts" },
  { label: "Treasure Hunt", ariaLabel: "Start the treasure hunt", link: "#treasure-hunt" },
];

const socialItems: StaggeredMenuSocialItem[] = [
  { label: "Facebook", link: "https://www.facebook.com/" },
  { label: "Instagram", link: "https://www.instagram.com/" },
  { label: "Website", link: "https://www.cambodia-airports.aero/" },
];

export default function Navbar() {
  return (
    <StaggeredMenu
      isFixed
      position="right"
      items={menuItems}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      logoUrl="/TIA-Logo.svg"
      menuButtonColor="#093B3F"
      openMenuButtonColor="#093B3F"
      changeMenuColorOnOpen={false}
      accentColor="#D6A63A"
      colors={["#3C6669", "#093B3F"]}
    />
  );
}
