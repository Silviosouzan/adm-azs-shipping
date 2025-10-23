package azship.mapper;

import azship.dto.FreightDTO;
import azship.model.Freight;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring", // Gera um Bean Spring
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface FreightMapper {

    FreightDTO toDTO(Freight freight);

    Freight toEntity(FreightDTO freightDTO);

    // Método crucial para o "update"
    void updateEntityFromDTO(FreightDTO dto, @MappingTarget Freight existingFreight);
}