package azship.service;

import azship.dto.FreightDTO;
import azship.mapper.FreightMapper; // <-- USANDO O MAPPER
import azship.model.Freight;
import azship.repository.FreightSpecification; // <-- USANDO A SPEC
import azship.repository.FreightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List; // Import List

@Service
public class FreightService {

    @Autowired
    private FreightRepository freightRepository;

    @Autowired
    private FreightMapper freightMapper; // Injetando o mapper

    /**
     * MÉTODO CORRIGIDO: Aceita Pageable e os 4 filtros.
     * Chama FreightSpecification.build com os argumentos corretos.
     */
    @Transactional(readOnly = true)
    public Page<FreightDTO> findAll(
            Pageable pageable, // Recebe o objeto Pageable
            String searchTerm,
            String status,
            String propertyKey,
            String propertyValue
    ) {
        // Constrói a Specification passando os filtros recebidos
        Specification<Freight> spec = FreightSpecification.build(searchTerm, status, propertyKey, propertyValue);
        // Executa a busca paginada com a Specification
        Page<Freight> freightPage = freightRepository.findAll(spec, pageable);
        // Mapeia a Page<Entity> para Page<DTO>
        return freightPage.map(freightMapper::toDTO);
    }


    @Transactional(readOnly = true)
    public FreightDTO findById(Long id) {
        return freightRepository.findById(id)
                .map(freightMapper::toDTO)
                // Usando RuntimeException por simplicidade, idealmente seria uma exceção customizada
                .orElseThrow(() -> new RuntimeException("Frete não encontrado com ID: " + id));
    }

    @Transactional
    public FreightDTO create(FreightDTO dto) {
        Freight freight = freightMapper.toEntity(dto);
        freight.setId(null); // Garante que é uma criação
        freight = freightRepository.save(freight);
        return freightMapper.toDTO(freight);
    }

    @Transactional
    public FreightDTO update(Long id, FreightDTO dto) {
        // Busca a entidade existente
        Freight existingFreight = freightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Frete não encontrado com ID: " + id));

        // Usa o mapper para atualizar os campos da entidade existente com os dados do DTO
        freightMapper.updateEntityFromDTO(dto, existingFreight);

        // Salva a entidade atualizada
        Freight updatedFreight = freightRepository.save(existingFreight);
        return freightMapper.toDTO(updatedFreight);
    }

    @Transactional
    public void delete(Long id) {
        if (!freightRepository.existsById(id)) {
            throw new RuntimeException("Frete não encontrado com ID: " + id);
        }
        freightRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<String> findUniqueStatuses() {
        return freightRepository.findDistinctStatuses();
    }
}