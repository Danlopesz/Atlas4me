package atlas4me.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import atlas4me.entity.Country;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByIsoCode(String isoCode);

    Optional<Country> findByName(String name);

    // Query para pegar aleatório (sem checar active, pois todos são ativos)
    @Query(value = "SELECT * FROM countries ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Optional<Country> findRandomCountry();

}
