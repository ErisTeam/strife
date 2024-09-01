{
    description = "Discord client.";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
        nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
    };

    outputs = { self, nixpkgs, ... }:
    let
        system = "x86_64-linux";
        pkgs = nixpkgs.legacyPackages.${system};
        projectName = "Strife";
    in
    {
        devShells.${system}.default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
                rustup
                openssl
                pkg-config

                nodejs_22
                nodePackages.pnpm

                #gtk3
                gtk4
                glib
                glibc
                #webkitgtk
                webkitgtk_4_1
                libsoup_3
                protobuf_23
                openjdk

                # LSP
                typescript
                nodePackages.typescript-language-server
            ];

            shellHook = ''
                printf '\x1b[36m\x1b[1m\x1b[4mTime to develop ${projectName}!\x1b[0m\n\n'
            '';
        };
    };
}
