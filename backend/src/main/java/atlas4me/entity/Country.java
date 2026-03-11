package atlas4me.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "countries")
@Data // Cria automaticamente os Getters, Setters, toString, etc.
@NoArgsConstructor // Cria construtor vazio (obrigatório pro JPA)
@AllArgsConstructor // Cria construtor com todos os campos
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // O @Column(name = "...") ensina o Java a ler a coluna do banco que tem sublinhado (_)
    @Column(name = "iso_code", nullable = false)
    private String isoCode; // Ex: "BR", "AR"

    @Column(name = "image_url")
    private String imageUrl; // A URL da bandeira/imagem do país

    // ... outros campos
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "continent")
    private String continent;
}