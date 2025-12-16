package atlas4me.repository;

import atlas4me.entity.Country;
import atlas4me.entity.CountryFeature;
import atlas4me.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CountryFeatureRepository extends JpaRepository<CountryFeature, Long> {
    
    // O método correto no lugar correto!
    Optional<CountryFeature> findByCountryAndQuestion(Country country, Question question);
}